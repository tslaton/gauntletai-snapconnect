/**
 * @file This file contains API functions for managing events.
 * It provides functions for fetching and searching events from the database.
 */

import { supabase } from '@/utils/supabase';

/**
 * Interface for event data from the database
 */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startTime: string;
  endTime: string | null;
  imageUrl: string | null;
  tags: string[];
  maxAttendees: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for event with creator information
 */
export interface EventWithCreator extends Event {
  creator: {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
}

/**
 * Fetches all events from the database with optional search filtering.
 * Events are sorted by start_time in ascending order (upcoming events first).
 * 
 * @param search - Optional search term to filter events by title, description, location, or tags
 * @returns Promise resolving to array of events
 */
export async function listEvents(search?: string): Promise<Event[]> {
  try {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        image_url,
        tags,
        max_attendees,
        created_by,
        created_at,
        updated_at
      `)
      .order('start_time', { ascending: true });

    // Add search filtering if search term is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      
      // Search across title, description, and location
      // Note: Tag search temporarily disabled to fix syntax error
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }

    const { data: eventsData, error: eventsError } = await query;

    if (eventsError) {
      console.error('Database error fetching events:', eventsError);
      throw new Error('Failed to fetch events. Please try again.');
    }

    if (!eventsData) {
      return [];
    }

    // Transform the data to match our interface
    return eventsData.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
      imageUrl: event.image_url,
      tags: event.tags || [],
      maxAttendees: event.max_attendees,
      createdBy: event.created_by,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Fetches all events with creator information.
 * Events are sorted by start_time in ascending order (upcoming events first).
 * 
 * @param search - Optional search term to filter events
 * @returns Promise resolving to array of events with creator details
 */
export async function listEventsWithCreators(search?: string): Promise<EventWithCreator[]> {
  try {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        image_url,
        tags,
        max_attendees,
        created_by,
        created_at,
        updated_at,
        profiles!events_created_by_profiles_id_fk (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('start_time', { ascending: true });

    // Add search filtering if search term is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      
      // Search across title, description, and location
      // Note: Tag search temporarily disabled to fix syntax error
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }

    const { data: eventsData, error: eventsError } = await query;

    if (eventsError) {
      console.error('Database error fetching events with creators:', eventsError);
      throw new Error('Failed to fetch events. Please try again.');
    }

    if (!eventsData) {
      return [];
    }

    // Transform the data to match our interface
    return eventsData.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
      imageUrl: event.image_url,
      tags: event.tags || [],
      maxAttendees: event.max_attendees,
      createdBy: event.created_by,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      creator: event.profiles ? {
        id: (event.profiles as any).id,
        username: (event.profiles as any).username,
        fullName: (event.profiles as any).full_name,
        avatarUrl: (event.profiles as any).avatar_url,
      } : null,
    }));
  } catch (error) {
    console.error('Error fetching events with creators:', error);
    throw error;
  }
}

/**
 * Fetches a single event by ID.
 * 
 * @param eventId - The ID of the event to fetch
 * @returns Promise resolving to the event or null if not found
 */
export async function getEventById(eventId: string): Promise<EventWithCreator | null> {
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        image_url,
        tags,
        max_attendees,
        created_by,
        created_at,
        updated_at,
        profiles!events_created_by_profiles_id_fk (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return null; // Event not found
      }
      console.error('Database error fetching event:', eventError);
      throw new Error('Failed to fetch event. Please try again.');
    }

    if (!eventData) {
      return null;
    }

    // Transform the data to match our interface
    return {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      startTime: eventData.start_time,
      endTime: eventData.end_time,
      imageUrl: eventData.image_url,
      tags: eventData.tags || [],
      maxAttendees: eventData.max_attendees,
      createdBy: eventData.created_by,
      createdAt: eventData.created_at,
      updatedAt: eventData.updated_at,
      creator: eventData.profiles ? {
        id: (eventData.profiles as any).id,
        username: (eventData.profiles as any).username,
        fullName: (eventData.profiles as any).full_name,
        avatarUrl: (eventData.profiles as any).avatar_url,
      } : null,
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
} 