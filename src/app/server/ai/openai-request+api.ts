import type { Activity } from '@/types/activities';
import type { Itinerary } from '@/types/itineraries';
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Helper function to create activity generation prompt
function createActivityGenerationPrompt(itinerary: Itinerary, userPrompt?: string): string {
  const itineraryContext = `Itinerary Context:
- Title: ${itinerary.title}
- Description: ${itinerary.description || 'No description'}
- Duration: ${itinerary.start_time ? new Date(itinerary.start_time).toLocaleDateString() : 'Not specified'} to ${itinerary.end_time ? new Date(itinerary.end_time).toLocaleDateString() : 'Not specified'}`;

  if (userPrompt) {
    return `${itineraryContext}

User Request: ${userPrompt}

Based on the user's request and the itinerary context, create a complete activity with title, description, location, and relevant tags.`;
  }

  return itineraryContext;
}

// Helper function to get activity schema
function getActivityDataSchema() {
  return {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Suggested title for the activity"
      },
      description: {
        type: "string",
        description: "Description of the activity. Target ~50 words or fewer"
      },
      location: {
        type: "string",
        description: "Location for the activity. Favor giving this as a city, landmark, or point of interest over an exact street address"
      },
      tags: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Relevant tags for the activity"
      }
    },
    required: ["title", "description", "location", "tags"],
    additionalProperties: false
  };
}

// Helper function to get itinerary schema
function getItineraryDataSchema(includeActivities = false) {
  const schema: any = {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Itinerary title starting with destination (City, State, or Country)"
      },
      description: {
        type: "string",
        description: "Brief description of the itinerary"
      },
      start_time: {
        type: "string",
        description: "Start date/time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)"
      },
      end_time: {
        type: "string",
        description: "End date/time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)"
      }
    },
    required: ["title", "description"],
    additionalProperties: false
  };

  if (includeActivities) {
    schema.properties.activities = {
      type: "array",
      description: "List of activities with non-overlapping times within itinerary bounds",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          location: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          start_time: { type: "string", description: "ISO 8601 format" },
          end_time: { type: "string", description: "ISO 8601 format" }
        },
        required: ["title", "description", "location", "tags"]
      }
    };
    schema.required.push("activities");
  }

  return schema;
}

const headers = {
  'Content-Type': 'application/json',
}

interface OpenAIRequestsBody {
  type: string
  [key: string]: unknown
}

interface FillActivityDataRequest extends OpenAIRequestsBody {
  type: 'fill-activity-data'
  activity: Partial<Activity>
  itinerary: Itinerary
}

interface GenerateActivityImageRequest extends OpenAIRequestsBody {
  type: 'generate-activity-image'
  activity: Partial<Activity>
  itinerary: Itinerary
}

interface CreateActivityFromPromptRequest extends OpenAIRequestsBody {
  type: 'create-activity-from-prompt'
  prompt: string
  itinerary: Itinerary
}

interface FillItineraryDataRequest extends OpenAIRequestsBody {
  type: 'fill-itinerary-data'
  itinerary: Partial<Itinerary>
}

interface GenerateItineraryImageRequest extends OpenAIRequestsBody {
  type: 'generate-itinerary-image'
  itinerary: Partial<Itinerary>
}

interface CreateItineraryFromPromptRequest extends OpenAIRequestsBody {
  type: 'create-itinerary-from-prompt'
  prompt: string
}

interface GenerateImageCaptionRequest extends OpenAIRequestsBody {
  type: 'generate-image-caption'
  image: string // base64 encoded image
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers
      })
    }

    // Ensure the request has a JSON content type
    if (req.headers.get("Content-Type") !== "application/json") {
      return new Response(
        JSON.stringify({ error: "Request must be of type application/json" }),
        {
          status: 400,
          headers
        }
      )
    }

    // Extract data from the body
    const { type, ...rest } = (await req.json()) as OpenAIRequestsBody

    console.log(`Successfully authenticated request: ${authHeader}`)

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // Create a _stateless_ Supabase client. By disabling both `persistSession` and
    // `autoRefreshToken`, the auth library will **not** attempt to read from
    // `AsyncStorage` (which relies on a `window` global) when this code runs in
    // the Node/Expo "server" runtime.
    // const supabase = createSupabaseClientForServer(authHeader)
    
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    console.log('supabase', supabase)
    
    switch (type) {
      case 'fill-activity-data': {
        const { activity, itinerary } = rest as FillActivityDataRequest;
        
        const basePrompt = createActivityGenerationPrompt(itinerary);
        const prompt = `You are helping to fill in missing information for an activity within a travel itinerary.

${basePrompt}

Current Activity Information:
- Title: ${activity.title || '[MISSING]'}
- Description: ${activity.description || '[MISSING]'}
- Location: ${activity.location || '[MISSING]'}
- Tags: ${activity.tags?.join(', ') || '[MISSING]'}

Please provide suggestions to fill in the missing fields for this activity. Consider the context of the itinerary and make reasonable suggestions that would enhance the travel experience. Do not suggest start_time or end_time.

Only include fields that need to be filled or improved. Ensure suggestions are relevant to the itinerary context.`;

        const response = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: [
            { role: "system", content: "You are a helpful travel planning assistant." },
            { role: "user", content: prompt }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "activity_data_suggestions",
              strict: false,
              schema: getActivityDataSchema()
            }
          }
        });
        
        const suggestions = JSON.parse(response.output_text || '{}');

        return new Response(JSON.stringify({ suggestions }), { headers })
      }
      case 'generate-activity-image': {
        const { activity, itinerary } = rest as GenerateActivityImageRequest;
        
        // First, get a summary for the image generation
        const summaryPrompt = `Create a concise, visual description for a DALL-E image that represents this travel activity:

Activity: ${activity.title || 'Travel activity'}
Description: ${activity.description || ''}
Location: ${activity.location || ''}
Tags: ${activity.tags?.join(', ') || ''}

Itinerary Context: ${itinerary.title} - ${itinerary.description || ''}

Provide a vivid, detailed description that would create an appealing travel photo for this activity. Focus on visual elements, atmosphere, and the experience.`;

        const summaryResponse = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: summaryPrompt
        });
        
        // Generate the image using DALL-E-3
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: summaryResponse.output_text || '',
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
          response_format: 'b64_json'
        });
        
        const b64Json = imageResponse.data?.[0]?.b64_json as string;
        if (!b64Json) {
          throw new Error('Failed to generate image data from OpenAI.');
        }
        
        // Convert base64 to buffer
        const buffer = new Uint8Array(
          atob(b64Json)
            .split("")
            .map(char => char.charCodeAt(0))
        );
        
        // Upload to Supabase storage
        const filePath = `activities/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const { error } = await supabase.storage
          .from('photos')
          .upload(filePath, buffer, {
            contentType: 'image/png'
          });
          
        if (error) {
          throw new Error(`Supabase upload error: ${error.message}`);
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);
        
        return new Response(JSON.stringify({ image_url: publicUrl }), { headers })
      }
      case 'create-activity-from-prompt': {
        const { prompt: userPrompt, itinerary } = rest as CreateActivityFromPromptRequest;
        
        const prompt = createActivityGenerationPrompt(itinerary, userPrompt);

        const response = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: [
            { role: "system", content: "You are a helpful travel planning assistant. Create activities that are specific, actionable, and enhance the travel experience." },
            { role: "user", content: prompt }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "new_activity",
              strict: false,
              schema: getActivityDataSchema()
            }
          }
        });
        
        const activityData = JSON.parse(response.output_text || '{}');

        return new Response(JSON.stringify({ activity: activityData }), { headers })
      }
      case 'fill-itinerary-data': {
        const { itinerary } = rest as FillItineraryDataRequest;
        
        const prompt = `You are helping to fill in missing information for a travel itinerary.

Current Itinerary Information:
- Title: ${itinerary.title || '[MISSING]'}
- Description: ${itinerary.description || '[MISSING]'}
- Start Date: ${itinerary.start_time ? new Date(itinerary.start_time).toLocaleDateString() : '[MISSING]'}
- End Date: ${itinerary.end_time ? new Date(itinerary.end_time).toLocaleDateString() : '[MISSING]'}

Please provide suggestions to fill in the missing fields. If the title is missing or doesn't start with a destination, suggest a title that begins with the destination (City, State, or Country).

Only include fields that need to be filled or improved.`;

        const response = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: [
            { role: "system", content: "You are a helpful travel planning assistant." },
            { role: "user", content: prompt }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "itinerary_data_suggestions",
              strict: false,
              schema: getItineraryDataSchema(false)
            }
          }
        });
        
        const suggestions = JSON.parse(response.output_text || '{}');

        return new Response(JSON.stringify({ suggestions }), { headers })
      }
      case 'generate-itinerary-image': {
        const { itinerary } = rest as GenerateItineraryImageRequest;
        
        // First, get a summary for the image generation
        const summaryPrompt = `Create a concise, visual description for a DALL-E image that represents this travel itinerary:

Itinerary: ${itinerary.title || 'Travel itinerary'}
Description: ${itinerary.description || ''}
Duration: ${itinerary.start_time ? new Date(itinerary.start_time).toLocaleDateString() : ''} to ${itinerary.end_time ? new Date(itinerary.end_time).toLocaleDateString() : ''}

Provide a vivid, detailed description that would create an appealing travel cover photo for this itinerary. Focus on the destination's most iconic elements, atmosphere, and experiences.`;

        const summaryResponse = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: summaryPrompt
        });
        
        // Generate the image using DALL-E-3
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: summaryResponse.output_text || '',
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
          response_format: 'b64_json'
        });
        
        const b64Json = imageResponse.data?.[0]?.b64_json as string;
        if (!b64Json) {
          throw new Error('Failed to generate image data from OpenAI.');
        }
        
        // Convert base64 to buffer
        const buffer = new Uint8Array(
          atob(b64Json)
            .split("")
            .map(char => char.charCodeAt(0))
        );
        
        // Upload to Supabase storage
        const filePath = `itineraries/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const { error } = await supabase.storage
          .from('photos')
          .upload(filePath, buffer, {
            contentType: 'image/png'
          });
          
        if (error) {
          throw new Error(`Supabase upload error: ${error.message}`);
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);
        
        return new Response(JSON.stringify({ image_url: publicUrl }), { headers })
      }
      case 'create-itinerary-from-prompt': {
        const { prompt: userPrompt } = rest as CreateItineraryFromPromptRequest;
        
        const prompt = `Based on the user's travel request below, create a complete itinerary with title, description, dates, and a suggested list of activities.

User Request: ${userPrompt}

IMPORTANT:
1. The itinerary title MUST start with the destination (City, State, or Country)
2. Parse any dates mentioned in the request and format them as ISO 8601
3. Create a logical sequence of activities with non-overlapping times
4. Activities should fit within the itinerary's start and end dates
5. If no dates are mentioned, leave start_time and end_time as null`;

        const response = await openai.responses.create({
          model: "gpt-4.1-nano",
          input: [
            { role: "system", content: "You are an expert travel planner. Create detailed, practical itineraries with well-timed activities." },
            { role: "user", content: prompt }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "new_itinerary",
              strict: false,
              schema: getItineraryDataSchema(true)
            }
          }
        });
        
        const itineraryData = JSON.parse(response.output_text || '{}');

        return new Response(JSON.stringify({ itinerary: itineraryData }), { headers })
      }
      case 'generate-image-caption': {
        const { image } = rest as GenerateImageCaptionRequest;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Generate a fun, engaging caption for this photo. Keep it concise (under 100 characters), casual, and suitable for social media. Don't describe the image literally, instead create something witty, emotional, or thought-provoking that complements the photo."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 150
        });
        
        const caption = response.choices[0]?.message?.content || "Picture perfect moment! ✨";
        
        return new Response(JSON.stringify({ caption }), { headers })
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid task type' }), {
          status: 400,
          headers
        })
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers,
    })
  }
}