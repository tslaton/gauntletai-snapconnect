/**
 * @file This file contains API functions for AI-related operations.
 * It provides functions for interacting with OpenAI endpoints.
 */

import type { Activity } from './activities';
import type { Itinerary } from './itineraries';
import { supabase } from '@/utils/supabase';

/**
 * Interface for AI activity suggestions
 */
export interface ActivitySuggestions {
  title?: string;
  description?: string;
  location?: string;
  tags?: string[];
  image_url?: string;
}

/**
 * Interface for complete activity data
 */
export interface ActivityData {
  title: string;
  description: string;
  location: string;
  tags: string[];
}

/**
 * Interface for itinerary suggestions
 */
export interface ItinerarySuggestions {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Interface for complete itinerary data with activities
 */
export interface ItineraryDataWithActivities {
  title: string;
  description: string;
  start_time?: string;
  end_time?: string;
  activities: {
    title: string;
    description: string;
    location: string;
    tags: string[];
    start_time?: string;
    end_time?: string;
  }[];
}

/**
 * Fills in missing activity data fields using AI suggestions (excluding image)
 * @param activity - Partial activity data
 * @param itinerary - Parent itinerary for context
 * @returns AI-generated suggestions for missing fields
 */
export async function fillActivityDataWithAI(
  activity: Partial<Activity>,
  itinerary: Itinerary
): Promise<Omit<ActivitySuggestions, 'image_url'>> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'fill-activity-data',
        activity,
        itinerary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI suggestions');
    }

    const data = await response.json();
    return data.suggestions || {};
  } catch (error) {
    console.error('Error filling activity data with AI:', error);
    throw error;
  }
}

/**
 * Generates an AI image for an activity
 * @param activity - Partial activity data
 * @param itinerary - Parent itinerary for context
 * @returns Generated image URL
 */
export async function generateActivityImageWithAI(
  activity: Partial<Activity>,
  itinerary: Itinerary
): Promise<{ image_url: string }> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'generate-activity-image',
        activity,
        itinerary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate AI image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating activity image with AI:', error);
    throw error;
  }
}

/**
 * Creates a new activity from a user prompt
 * @param prompt - User's description of the desired activity
 * @param itinerary - Parent itinerary for context
 * @returns Complete activity data
 */
export async function createActivityFromPrompt(
  prompt: string,
  itinerary: Itinerary
): Promise<ActivityData> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'create-activity-from-prompt',
        prompt,
        itinerary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create activity from prompt');
    }

    const data = await response.json();
    return data.activity;
  } catch (error) {
    console.error('Error creating activity from prompt:', error);
    throw error;
  }
}

/**
 * Fills in missing itinerary data fields using AI suggestions (excluding image)
 * @param itinerary - Partial itinerary data
 * @returns AI-generated suggestions for missing fields
 */
export async function fillItineraryDataWithAI(
  itinerary: Partial<Itinerary>
): Promise<ItinerarySuggestions> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'fill-itinerary-data',
        itinerary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI suggestions');
    }

    const data = await response.json();
    return data.suggestions || {};
  } catch (error) {
    console.error('Error filling itinerary data with AI:', error);
    throw error;
  }
}

/**
 * Generates an AI image for an itinerary
 * @param itinerary - Partial itinerary data
 * @returns Generated image URL
 */
export async function generateItineraryImageWithAI(
  itinerary: Partial<Itinerary>
): Promise<{ image_url: string }> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'generate-itinerary-image',
        itinerary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate AI image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating itinerary image with AI:', error);
    throw error;
  }
}

/**
 * Creates a new itinerary with activities from a user prompt
 * @param prompt - User's description of the desired trip
 * @returns Complete itinerary data with activities
 */
export async function createItineraryFromPrompt(
  prompt: string
): Promise<ItineraryDataWithActivities> {
  try {
    // Get the current user's auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }

    const response = await fetch('/server/ai/openai-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'create-itinerary-from-prompt',
        prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create itinerary from prompt');
    }

    const data = await response.json();
    return data.itinerary;
  } catch (error) {
    console.error('Error creating itinerary from prompt:', error);
    throw error;
  }
}

