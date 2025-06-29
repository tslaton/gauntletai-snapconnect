// geocode.ts
export type Coordinates = { lat: number; lng: number };

interface OpenCageTimezone {
  name: string;
  abbreviation: string;
  offset_sec: number;
  offset_string: string;
}

interface OpenCageResponse {
  results: {
    confidence: number;
    geometry: {
      lat: number;
      lng: number;
    };
    annotations: {
      timezone: OpenCageTimezone;
    };
  }[];
}

// https://www.perplexity.ai/search/consider-the-api-https-opencag-wIMQxA8jRQiloqp4.rvMAg
// export function convertToTimezone(targetTimezone: OpenCageTimezone, userTimestamp: Date): Date {
//     // Get user's timezone offset in minutes
//     const userOffsetMinutes = userTimestamp.getTimezoneOffset();
    
//     // Convert target timezone offset from seconds to minutes
//     const targetOffsetMinutes = -(targetTimezone.offset_sec / 60);
    
//     // Calculate the difference in minutes
//     const offsetDifference = targetOffsetMinutes - (-userOffsetMinutes);
    
//     // Apply the offset difference
//     return new Date(userTimestamp.getTime() + (offsetDifference * 60 * 1000));
// }

// https://opencagedata.com/demo
export async function geocodeAndTimezone(query: string): Promise<{ coordinates: Coordinates | null, timezone: string | null }> {
  console.log('[geocode] Starting geocode request for query:', query);
  
  if (!query) {
    console.log('[geocode] Empty query provided, returning null');
    return { coordinates: null, timezone: null };
  }
  
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error('[geocode] EXPO_PUBLIC_OPENCAGE_API_KEY is not set in environment variables');
      return { coordinates: null, timezone: null };
    }
    
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query,
    )}&key=${apiKey}`;
    console.log('[geocode] Fetching from OpenCage API...');
    
    const res = await fetch(url);
    console.log('[geocode] API response status:', res.status);
    
    if (!res.ok) {
      console.error('[geocode] API request failed with status:', res.status, res.statusText);
      return { coordinates: null, timezone: null };
    }
    
    const data: OpenCageResponse = await res.json();
    const results = data.results;
    
    console.log('[geocode] Number of results returned:', results?.length || 0);
    
    if (!results || !results.length) {
      console.log('[geocode] No results found for query:', query);
      return { coordinates: null, timezone: null };
    }
    
    // Log confidence scores before sorting
    console.log('[geocode] Results with confidence scores:', 
      results.map((r, i) => ({
        index: i,
        confidence: r.confidence || 0,
        lat: r.geometry?.lat,
        lng: r.geometry?.lng
      }))
    );
    
    // Sort results by confidence in descending order, defaulting to 0 if not present
    data.results.sort((a, b) => {
      const confidenceA = a.confidence || 0;
      const confidenceB = b.confidence || 0;
      return confidenceB - confidenceA; // Descending order
    });
    
    const result = results[0];
    const coordinates = { lat: result.geometry.lat, lng: result.geometry.lng };
    const timezone = result.annotations?.timezone?.name;

    console.log('[geocode] Selected highest confidence result:', {
      confidence: result.confidence,
      coordinates,
      timezone
    });
    
    return { coordinates, timezone };
  } catch (error) {
    console.error('[geocode] Error during geocoding:', error);
    if (error instanceof Error) {
      console.error('[geocode] Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return { coordinates: null, timezone: null };
  }
}
