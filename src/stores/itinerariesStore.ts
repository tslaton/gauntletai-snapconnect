/**
 * @file This file contains the Zustand store for managing itineraries data.
 * It handles fetching, creating, updating, searching, and holding the state for itineraries.
 */

import { create } from 'zustand';
import {
  getItineraries as getItinerariesFromApi,
  getItinerary as getItineraryFromApi,
  createItinerary as createItineraryFromApi,
  updateItinerary as updateItineraryFromApi,
  deleteItinerary as deleteItineraryFromApi,
  searchItineraries as searchItinerariesFromApi,
  type Itinerary,
  type CreateItineraryData,
  type UpdateItineraryData
} from '@/api/itineraries';

/**
 * Interface for the Itineraries store state and its actions
 */
interface ItinerariesStoreState {
  // State properties
  itineraries: Itinerary[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchItineraries: () => Promise<void>;
  fetchItinerary: (id: string) => Promise<Itinerary | null>;
  createItinerary: (data: CreateItineraryData) => Promise<Itinerary>;
  updateItinerary: (id: string, data: UpdateItineraryData) => Promise<Itinerary>;
  deleteItinerary: (id: string) => Promise<void>;
  searchItineraries: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // Helper methods
  getItineraryById: (id: string) => Itinerary | undefined;
}

/**
 * A Zustand store for managing itineraries functionality.
 *
 * @returns A store with state and actions for itineraries management
 */
export const useItinerariesStore = create<ItinerariesStoreState>((set, get) => ({
  // Initial state
  itineraries: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  // Actions
  clearError: () => set({ error: null }),
  
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  fetchItineraries: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getItinerariesFromApi();
      set({ itineraries: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch itineraries';
      set({ error: message });
      console.error('Error fetching itineraries:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchItinerary: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getItineraryFromApi(id);
      if (data) {
        // Update the specific itinerary in the list
        const currentItineraries = get().itineraries;
        const updatedItineraries = currentItineraries.map(itinerary =>
          itinerary.id === id ? data : itinerary
        );
        
        // Add it if it doesn't exist
        if (!currentItineraries.find(i => i.id === id)) {
          updatedItineraries.push(data);
        }
        
        set({ itineraries: updatedItineraries });
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch itinerary';
      set({ error: message });
      console.error('Error fetching itinerary:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  createItinerary: async (data: CreateItineraryData) => {
    set({ isLoading: true, error: null });
    try {
      const newItinerary = await createItineraryFromApi(data);
      
      // Add the new itinerary to the list
      const currentItineraries = get().itineraries;
      set({ itineraries: [newItinerary, ...currentItineraries] });
      
      return newItinerary;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create itinerary';
      set({ error: message });
      console.error('Error creating itinerary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateItinerary: async (id: string, data: UpdateItineraryData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItinerary = await updateItineraryFromApi(id, data);
      
      // Update the itinerary in the list
      const currentItineraries = get().itineraries;
      set({
        itineraries: currentItineraries.map(itinerary =>
          itinerary.id === id ? updatedItinerary : itinerary
        )
      });
      
      return updatedItinerary;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update itinerary';
      set({ error: message });
      console.error('Error updating itinerary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteItinerary: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteItineraryFromApi(id);
      
      // Remove the itinerary from the list
      const currentItineraries = get().itineraries;
      set({
        itineraries: currentItineraries.filter(itinerary => itinerary.id !== id)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete itinerary';
      set({ error: message });
      console.error('Error deleting itinerary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  searchItineraries: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const data = await searchItinerariesFromApi(query);
      set({ itineraries: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search itineraries';
      set({ error: message });
      console.error('Error searching itineraries:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  getItineraryById: (id: string) => {
    return get().itineraries.find(itinerary => itinerary.id === id);
  }
}));