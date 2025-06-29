// geocode.ts
export type Coordinates = { lat: number; lng: number };

interface OpenCageResponse {
  results: {
    confidence: number;
    geometry: {
      lat: number;
      lng: number;
    };
  }[];
}

// https://opencagedata.com/demo
export async function geocode(query: string): Promise<Coordinates | null> {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query,
    )}&key=${process.env.OPENCAGE_API_KEY!}`;
    const res = await fetch(url);
    const data: OpenCageResponse = await res.json();
    const results = data.results;
    if (!results.length) return null;
    // Sort results by confidence in descending order, defaulting to 0 if not present
    data.results.sort((a, b) => {
      const confidenceA = a.confidence || 0;
      const confidenceB = b.confidence || 0;
      return confidenceB - confidenceA; // Descending order
    });
    const result = results[0];
    return { lat: result.geometry.lat, lng: result.geometry.lng };
  } catch (error) {
    console.error('Error geocoding:', error);
    return null;
  }
}
