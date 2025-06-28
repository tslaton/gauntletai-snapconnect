/**
 * @file This file contains API functions for managing activities within itineraries.
 * It provides functions for creating, updating, fetching, and deleting activities.
 */

import { supabase } from '@/utils/supabase';

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

  const { data, error } = await supabase
    .from('activities')
    .insert({
      ...activityData,
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

  const { data, error } = await supabase
    .from('activities')
    .update(updates)
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