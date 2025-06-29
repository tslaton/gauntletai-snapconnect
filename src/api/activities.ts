/**
 * @file This file contains API functions for managing activities within itineraries.
 * It provides functions for creating, updating, fetching, and deleting activities.
 */

import { extractCapitalizedWords, findMostCommon } from '@/utils';
import { geocodeAndTimezone } from '@/utils/geocode';
import { supabase } from '@/utils/supabase';
import { getMaterialIcon, getWeather } from '@/utils/weather';
import { getItinerary } from './itineraries';

/**
 * Interface for activity data
 */
export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  image_url?: string | null;
  tags?: string[];
  weather?: string | null;
  temperature?: string | null;
  precipitation_chance?: string | null;
  gps_coords?: [number, number] | null;
  timezone?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  itinerary_id: string;
}

/**
 * Interface for creating a new activity
 */
export interface CreateActivityData {
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  tags?: string[];
  itinerary_id: string;
}

/**
 * Interface for updating an existing activity
 */
export interface UpdateActivityData {
  title?: string;
  description?: string | null;
  location?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  image_url?: string | null;
  weather?: string | null;
  temperature?: string | null;
  precipitation_chance?: string | null;
  gps_coords?: [number, number] | null;
  timezone?: string | null;
  tags?: string[];
}

/**
 * Custom error types for activity management
 */
export class ActivityValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ActivityValidationError';
  }
}

/**
 * Validates activity input data
 */
function validateActivityData(data: CreateActivityData | UpdateActivityData): void {
  if ('title' in data && data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ActivityValidationError('Title is required and cannot be empty', 'title');
    }
    if (data.title.length > 255) {
      throw new ActivityValidationError('Title must be less than 255 characters', 'title');
    }
  }

  if (data.start_time && data.end_time) {
    const startDate = new Date(data.start_time);
    const endDate = new Date(data.end_time);
    if (startDate >= endDate) {
      throw new ActivityValidationError('End time must be after start time', 'end_time');
    }
  }

  if ('itinerary_id' in data && !data.itinerary_id) {
    throw new ActivityValidationError('Itinerary ID is required', 'itinerary_id');
  }
}

/**
 * Enriches activity data with GPS coordinates and weather information
 */
async function enrichActivityData(
  activityData: CreateActivityData | UpdateActivityData,
  itineraryId: string
): Promise<Partial<Activity>> {
  console.log('[enrichActivityData] Starting enrichment for activity:', {
    title: activityData.title,
    location: activityData.location,
    itineraryId
  });
  
  const enrichedData: Partial<Activity> = { ...activityData };
  
  // Skip if no location is provided
  if (!activityData.location) {
    console.log('[enrichActivityData] No location provided, skipping enrichment');
    return enrichedData;
  }
  
  try {
    // Get the itinerary to extract capitalized words from the title
    console.log('[enrichActivityData] Fetching itinerary with ID:', itineraryId);
    const itinerary = await getItinerary(itineraryId);
    if (!itinerary) {
      console.log('[enrichActivityData] Itinerary not found, skipping enrichment');
      return enrichedData;
    }
    console.log('[enrichActivityData] Itinerary found:', { title: itinerary.title });
    
    // Build the geocoding query with the first capitalized word from the itinerary title
    const capitalizedWords = extractCapitalizedWords(itinerary.title);
    console.log('[enrichActivityData] Capitalized words extracted:', capitalizedWords);
    
    const firstCapitalizedWord = capitalizedWords.length > 0 ? capitalizedWords[0] : null;
    const geocodeQuery = firstCapitalizedWord 
      ? `${activityData.location} ${firstCapitalizedWord}`
      : activityData.location;
    console.log('[enrichActivityData] Geocode query built:', geocodeQuery);
    
    // Get GPS coordinates
    console.log('[enrichActivityData] Calling geocode API...');
    const { coordinates, timezone } = await geocodeAndTimezone(geocodeQuery);
    if (!coordinates) {
      console.log('[enrichActivityData] No coordinates returned from geocode API');
      return enrichedData;
    }
    console.log('[enrichActivityData] Coordinates received:', coordinates);
    if (!timezone) {
      console.log('[enrichActivityData] No timezone returned from geocode API');
      return enrichedData;
    }

    // Set GPS coordinates
    enrichedData.gps_coords = [coordinates.lat, coordinates.lng];

    // Set timezone
    enrichedData.timezone = timezone;

    // Check if we have time information for weather query
    const startTime = activityData.start_time;
    const endTime = activityData.end_time;
    console.log('[enrichActivityData] Time information:', { startTime, endTime });
    
    if (!startTime && !endTime) {
      console.log('[enrichActivityData] No time information provided, skipping weather enrichment');
      return enrichedData;
    }
    
    // If only one time is set, use it for both
    const actualStartTime = startTime || endTime;
    const actualEndTime = endTime || startTime;
    
    // Convert times to GMT+0 (UTC) for the weather API
    const startDate = new Date(actualStartTime!);
    const endDate = new Date(actualEndTime!);
    console.log('[enrichActivityData] Date range for weather:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Format dates as YYYY-MM-DD for the weather API
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Get weather data
    console.log('[enrichActivityData] Calling weather API...');
    const weatherData = await getWeather(
      coordinates.lat,
      coordinates.lng,
      ["temperature_2m", "precipitation_probability", "weather_code"],
      "GMT",
      "fahrenheit",
      formatDate(startDate),
      formatDate(endDate)
    );
    
    if (!weatherData || !weatherData.hourly) {
      console.log('[enrichActivityData] No weather data returned');
      return enrichedData;
    }
    console.log('[enrichActivityData] Weather data received:', {
      temperatureCount: weatherData.hourly.temperature?.length,
      precipitationCount: weatherData.hourly.precipitationProbability?.length,
      weatherCodeCount: weatherData.hourly.weatherCode?.length
    });
    
    // Debug: Log sample values to check if they're valid
    if (weatherData.hourly.temperature?.length > 0) {
      console.log('[enrichActivityData] Sample temperature values:', Array.from(weatherData.hourly.temperature).slice(0, 3));
    }
    if (weatherData.hourly.precipitationProbability?.length > 0) {
      console.log('[enrichActivityData] Sample precipitation values:', Array.from(weatherData.hourly.precipitationProbability).slice(0, 3));
    }
    if (weatherData.hourly.weatherCode?.length > 0) {
      console.log('[enrichActivityData] Sample weather codes:', Array.from(weatherData.hourly.weatherCode).slice(0, 3));
    }
    
    // Calculate average temperature
    const temperatures = weatherData.hourly.temperature;
    if (temperatures && temperatures.length > 0) {
      // Convert Float32Array to regular array and ensure numbers for reduce
      const tempArray = Array.from(temperatures).map(temp => Number(temp));
      const avgTemp = tempArray.reduce((sum, temp) => sum + temp, 0) / tempArray.length;
      enrichedData.temperature = avgTemp.toFixed(1).toString();
      console.log('[enrichActivityData] Average temperature calculated:', enrichedData.temperature);
    }
    
    // Calculate average precipitation probability
    const precipProbabilities = weatherData.hourly.precipitationProbability;
    if (precipProbabilities && precipProbabilities.length > 0) {
      // Convert Float32Array to regular array for reduce
      const precipArray = Array.from(precipProbabilities).map(prob => Number(prob));
      const avgPrecip = precipArray.reduce((sum, prob) => sum + prob, 0) / precipArray.length;
      enrichedData.precipitation_chance = avgPrecip.toFixed(0).toString();
      console.log('[enrichActivityData] Average precipitation chance calculated:', enrichedData.precipitation_chance);
    }
    
    // Find most common weather code and convert to Material icon
    const weatherCodes = weatherData.hourly.weatherCode;
    if (weatherCodes && weatherCodes.length > 0) {
      // Convert Float32Array to regular array for findMostCommon
      const weatherCodeArray = Array.from(weatherCodes).map(code => Number(code));
      const mostCommonCode = findMostCommon(weatherCodeArray);
      if (mostCommonCode !== null && typeof mostCommonCode === 'number') {
        // Convert start time to UTC string for getMaterialIcon
        const utcTimeString = startDate.toISOString();
        enrichedData.weather = getMaterialIcon(mostCommonCode, utcTimeString);
        console.log('[enrichActivityData] Weather icon determined:', {
          weatherCode: mostCommonCode,
          icon: enrichedData.weather
        });
      }
    }
    
    console.log('[enrichActivityData] Enrichment completed successfully');
  } catch (error) {
    console.error('[enrichActivityData] Error during enrichment:', error);
    // Return the original data if enrichment fails
  }
  
  console.log('[enrichActivityData] Final enriched data:', {
    gps_coords: enrichedData.gps_coords,
    timezone: enrichedData.timezone,
    temperature: enrichedData.temperature,
    precipitation_chance: enrichedData.precipitation_chance,
    weather: enrichedData.weather
  });
  
  return enrichedData;
}

/**
 * Verifies that the user owns the itinerary
 */
async function verifyItineraryOwnership(itineraryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('itineraries')
    .select('id')
    .eq('id', itineraryId)
    .eq('created_by', userId)
    .single();

  return !error && !!data;
}

/**
 * Fetches all activities for a specific itinerary
 */
export async function getActivitiesForItinerary(itineraryId: string): Promise<Activity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Verify user owns the itinerary
  const hasAccess = await verifyItineraryOwnership(itineraryId, user.id);
  if (!hasAccess) {
    throw new Error('You do not have permission to view activities for this itinerary');
  }

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches a single activity by ID
 */
export async function getActivity(id: string): Promise<Activity | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching activity:', error);
    throw error;
  }

  // Verify user has access to this activity
  if (data) {
    const hasAccess = await verifyItineraryOwnership(data.itinerary_id, user.id);
    if (!hasAccess) {
      throw new Error('You do not have permission to view this activity');
    }
  }

  return data;
}

/**
 * Creates a new activity
 */
export async function createActivity(activityData: CreateActivityData): Promise<Activity> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate input
  validateActivityData(activityData);

  // Verify user owns the itinerary
  const hasAccess = await verifyItineraryOwnership(activityData.itinerary_id, user.id);
  if (!hasAccess) {
    throw new Error('You do not have permission to add activities to this itinerary');
  }

  // Enrich activity data with GPS coordinates and weather
  const enrichedData = await enrichActivityData(activityData, activityData.itinerary_id);

  const { data, error } = await supabase
    .from('activities')
    .insert({
      ...enrichedData,
      created_by: user.id,
      tags: activityData.tags || []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }

  return data;
}

/**
 * Updates an existing activity
 */
export async function updateActivity(id: string, updates: UpdateActivityData): Promise<Activity> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate input
  validateActivityData(updates);

  // First, get the activity to verify ownership
  const existingActivity = await getActivity(id);
  if (!existingActivity) {
    throw new Error('Activity not found');
  }

  // Enrich activity data with GPS coordinates and weather
  const enrichedData = await enrichActivityData(updates, existingActivity.itinerary_id);

  const { data, error } = await supabase
    .from('activities')
    .update(enrichedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating activity:', error);
    throw error;
  }

  return data;
}

/**
 * Deletes an activity
 */
export async function deleteActivity(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First, get the activity to verify ownership
  const existingActivity = await getActivity(id);
  if (!existingActivity) {
    throw new Error('Activity not found');
  }

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

/**
 * Parses a semicolon-separated tags string into an array
 */
export function parseTagsString(tagsString: string): string[] {
  if (!tagsString || tagsString.trim().length === 0) {
    return [];
  }

  return tagsString
    .split(';')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Converts tags array to semicolon-separated string
 */
export function tagsToString(tags: string[]): string {
  return tags.join('; ');
}