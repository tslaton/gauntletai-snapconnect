/**
 * @file This file contains type definitions for activities.
 */

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