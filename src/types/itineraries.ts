/**
 * @file This file contains type definitions for itineraries.
 */

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