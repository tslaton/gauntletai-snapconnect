/**
 * @file This file contains API functions for managing itineraries.
 * It provides functions for creating, updating, fetching, and searching itineraries.
 */

import { supabase } from '@/utils/supabase';

/**
 * Interface for itinerary data
 */
export interface Itinerary {
  id: string;
  title: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cover_image_url?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for creating a new itinerary
 */
export interface CreateItineraryData {
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  cover_image_url?: string;
}

/**
 * Interface for updating an existing itinerary
 */
export interface UpdateItineraryData {
  title?: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cover_image_url?: string | null;
}

/**
 * Custom error types for itinerary management
 */
export class ItineraryValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ItineraryValidationError';
  }
}

/**
 * Validates itinerary input data
 */
function validateItineraryData(data: CreateItineraryData | UpdateItineraryData): void {
  if ('title' in data && data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ItineraryValidationError('Title is required and cannot be empty', 'title');
    }
    if (data.title.length > 255) {
      throw new ItineraryValidationError('Title must be less than 255 characters', 'title');
    }
  }

  if (data.start_time && data.end_time) {
    const startDate = new Date(data.start_time);
    const endDate = new Date(data.end_time);
    if (startDate >= endDate) {
      throw new ItineraryValidationError('End time must be after start time', 'end_time');
    }
  }
}

/**
 * Fetches all itineraries for the current user
 */
export async function getItineraries(): Promise<Itinerary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching itineraries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches a single itinerary by ID
 */
export async function getItinerary(id: string): Promise<Itinerary | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching itinerary:', error);
    throw error;
  }

  return data;
}

/**
 * Creates a new itinerary
 */
export async function createItinerary(itineraryData: CreateItineraryData): Promise<Itinerary> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate input
  validateItineraryData(itineraryData);

  const { data, error } = await supabase
    .from('itineraries')
    .insert({
      ...itineraryData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating itinerary:', error);
    throw error;
  }

  return data;
}

/**
 * Updates an existing itinerary
 */
export async function updateItinerary(id: string, updates: UpdateItineraryData): Promise<Itinerary> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate input
  validateItineraryData(updates);

  const { data, error } = await supabase
    .from('itineraries')
    .update(updates)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating itinerary:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Itinerary not found or you do not have permission to update it');
  }

  return data;
}

/**
 * Deletes an itinerary
 */
export async function deleteItinerary(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deleting itinerary:', error);
    throw error;
  }
}

/**
 * Searches itineraries by title or description
 */
export async function searchItineraries(query: string): Promise<Itinerary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (!query || query.trim().length === 0) {
    return getItineraries();
  }

  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('created_by', user.id)
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching itineraries:', error);
    throw error;
  }

  return data || [];
}