/**
 * @file This file contains the Zustand store for managing events data.
 * It handles events list, search functionality, and related state management.
 */

import {
  getEventById as apiGetEventById,
  listEvents as apiListEvents,
  type Event as ApiEvent,
  type EventWithCreator as ApiEventWithCreator
} from '@/api/events';
import { create } from 'zustand';

/**
 * Interface for event data (from API)
 */
export interface Event extends ApiEvent {}

/**
 * Interface for event with creator data (from API)
 */
export interface EventWithCreator extends ApiEventWithCreator {}

/**
 * Interface for the Events store state and its actions
 */
interface EventsState {
  // Events list state
  events: Event[];
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
  
  // Search state
  searchQuery: string;
  isSearching: boolean;
  searchError: string | null;
  
  // Individual event state
  selectedEvent: EventWithCreator | null;
  isLoadingEvent: boolean;
  eventError: string | null;
  
  // Actions - Events Management
  fetchEvents: (search?: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
  clearEvents: () => void;
  clearError: () => void;
  
  // Actions - Individual Event
  fetchEvent: (eventId: string) => Promise<void>;
  clearSelectedEvent: () => void;
  clearEventError: () => void;
  
  // Helper methods
  getEventById: (eventId: string) => Event | undefined;
  getEventsCount: () => number;
  getUpcomingEvents: () => Event[];
  getEventsByTag: (tag: string) => Event[];
}

/**
 * A Zustand store for managing events and event search functionality.
 *
 * @returns A store with state and actions for events management
 */
export const useEventsStore = create<EventsState>((set, get) => ({
  // Initial state
  events: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  
  searchQuery: '',
  isSearching: false,
  searchError: null,
  
  selectedEvent: null,
  isLoadingEvent: false,
  eventError: null,

  // --- EVENTS LIST ACTIONS ---

  /**
   * Fetches events from the API with optional search filtering
   * 
   * @param search - Optional search term to filter events
   */
  fetchEvents: async (search) => {
    const { isLoading } = get();
    
    // Don't fetch if already loading
    if (isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const events = await apiListEvents(search);
      
      set({ 
        events, 
        isLoading: false,
        lastFetch: new Date().toISOString(),
        error: null,
        // If this was a search, also update search state
        ...(search !== undefined && {
          searchQuery: search,
          isSearching: false,
          searchError: null
        })
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch events';
      console.error('Error fetching events:', error);
      set({ 
        error: message, 
        isLoading: false,
        // If this was a search, also update search error
        ...(search !== undefined && {
          isSearching: false,
          searchError: message
        })
      });
    }
  },

  /**
   * Refreshes the events list using the current search query
   */
  refreshEvents: async () => {
    const { searchQuery } = get();
    await get().fetchEvents(searchQuery || undefined);
  },

  /**
   * Searches events with a specific query
   * 
   * @param query - The search query string
   */
  searchEvents: async (query) => {
    set({ 
      searchQuery: query,
      isSearching: true, 
      searchError: null 
    });

    try {
      const events = await apiListEvents(query);
      set({ 
        events,
        isSearching: false,
        searchError: null,
        // Also update main loading state since we're updating events
        isLoading: false,
        error: null,
        lastFetch: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search events';
      console.error('Error searching events:', error);
      set({ 
        searchError: message, 
        isSearching: false 
      });
    }
  },

  /**
   * Clears search results and resets to all events
   */
  clearSearch: async () => {
    set({ 
      searchQuery: '', 
      searchError: null,
      isSearching: false
    });
    
    // Fetch all events without search filter
    await get().fetchEvents();
  },

  /**
   * Sets the search query in the store
   * 
   * @param query - The search query string
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  /**
   * Clears events data and resets state
   */
  clearEvents: () => {
    set({ 
      events: [], 
      error: null,
      lastFetch: null,
      searchQuery: '',
      searchError: null,
      isSearching: false,
      selectedEvent: null,
      eventError: null
    });
  },

  /**
   * Clears error state
   */
  clearError: () => {
    set({ error: null, searchError: null });
  },

  // --- INDIVIDUAL EVENT ACTIONS ---

  /**
   * Fetches a single event by ID with creator information
   * 
   * @param eventId - The event ID to fetch
   */
  fetchEvent: async (eventId) => {
    set({ isLoadingEvent: true, eventError: null });
    
    try {
      const event = await apiGetEventById(eventId);
      set({ 
        selectedEvent: event, 
        isLoadingEvent: false,
        eventError: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch event';
      console.error('Error fetching event:', error);
      set({ 
        eventError: message, 
        isLoadingEvent: false,
        selectedEvent: null
      });
    }
  },

  /**
   * Clears the selected event
   */
  clearSelectedEvent: () => {
    set({ selectedEvent: null, eventError: null });
  },

  /**
   * Clears event-specific error
   */
  clearEventError: () => {
    set({ eventError: null });
  },

  // --- HELPER METHODS ---

  /**
   * Gets an event by its ID from the current events list
   * 
   * @param eventId - The event ID to find
   * @returns The event object or undefined
   */
  getEventById: (eventId) => {
    const { events } = get();
    return events.find(event => event.id === eventId);
  },

  /**
   * Gets the total count of events in the current list
   * 
   * @returns The number of events
   */
  getEventsCount: () => {
    const { events } = get();
    return events.length;
  },

  /**
   * Gets upcoming events (events that haven't started yet)
   * 
   * @returns Array of upcoming events
   */
  getUpcomingEvents: () => {
    const { events } = get();
    const now = new Date();
    return events.filter(event => new Date(event.startTime) > now);
  },

  /**
   * Gets events that have a specific tag
   * 
   * @param tag - The tag to filter by
   * @returns Array of events with the specified tag
   */
  getEventsByTag: (tag) => {
    const { events } = get();
    return events.filter(event => 
      event.tags.some(eventTag => 
        eventTag.toLowerCase() === tag.toLowerCase()
      )
    );
  },
})); 