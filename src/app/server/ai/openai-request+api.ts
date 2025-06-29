// import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai";

const headers = {
  'Content-Type': 'application/json',
}

interface OpenAIRequestsBody {
  type: string
  [key: string]: unknown
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
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_KEY!
    // )

    const prompt = `To be determined...`

    switch (type) {
      case 'generate-project-cover': {
        const response = await openai.responses.create({
          model: "gpt-4.1",
          input: prompt,
        })
        const responseContent = response.output_text

        return new Response(JSON.stringify({ responseContent }), { headers })
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