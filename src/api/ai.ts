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

