/**
 * @file This file contains the Zustand store for managing activities data.
 * It handles fetching, creating, updating, and holding the state for activities within itineraries.
 */

import { create } from 'zustand';
import {
  getActivitiesForItinerary as getActivitiesForItineraryFromApi,
  getActivity as getActivityFromApi,
  createActivity as createActivityFromApi,
  updateActivity as updateActivityFromApi,
  deleteActivity as deleteActivityFromApi,
  type Activity,
  type CreateActivityData,
  type UpdateActivityData
} from '@/api/activities';

/**
 * Interface for the Activities store state and its actions
 */
interface ActivitiesStoreState {
  // State properties
  activities: { [itineraryId: string]: Activity[] };
  isLoading: boolean;
  error: string | null;
  currentItineraryId: string | null;
  
  // Actions
  fetchActivitiesForItinerary: (itineraryId: string) => Promise<void>;
  fetchActivity: (id: string) => Promise<Activity | null>;
  createActivity: (data: CreateActivityData) => Promise<Activity>;
  updateActivity: (id: string, data: UpdateActivityData) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  setCurrentItineraryId: (itineraryId: string | null) => void;
  clearError: () => void;
  
  // Helper methods
  getActivitiesForItinerary: (itineraryId: string) => Activity[];
  getActivityById: (id: string) => Activity | undefined;
}

/**
 * A Zustand store for managing activities functionality.
 *
 * @returns A store with state and actions for activities management
 */
export const useActivitiesStore = create<ActivitiesStoreState>((set, get) => ({
  // Initial state
  activities: {},
  isLoading: false,
  error: null,
  currentItineraryId: null,

  // Actions
  clearError: () => set({ error: null }),
  
  setCurrentItineraryId: (itineraryId: string | null) => set({ currentItineraryId: itineraryId }),
  
  fetchActivitiesForItinerary: async (itineraryId: string) => {
    set({ isLoading: true, error: null, currentItineraryId: itineraryId });
    try {
      const data = await getActivitiesForItineraryFromApi(itineraryId);
      const currentActivities = get().activities;
      set({ 
        activities: {
          ...currentActivities,
          [itineraryId]: data
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch activities';
      set({ error: message });
      console.error('Error fetching activities:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchActivity: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getActivityFromApi(id);
      if (data) {
        // Update the specific activity in the appropriate itinerary's list
        const currentActivities = get().activities;
        const itineraryActivities = currentActivities[data.itinerary_id] || [];
        
        const updatedActivities = itineraryActivities.map(activity =>
          activity.id === id ? data : activity
        );
        
        // Add it if it doesn't exist
        if (!itineraryActivities.find(a => a.id === id)) {
          updatedActivities.push(data);
        }
        
        set({
          activities: {
            ...currentActivities,
            [data.itinerary_id]: updatedActivities
          }
        });
      }
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch activity';
      set({ error: message });
      console.error('Error fetching activity:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  createActivity: async (data: CreateActivityData) => {
    set({ isLoading: true, error: null });
    try {
      const newActivity = await createActivityFromApi(data);
      
      // Add the new activity to the appropriate itinerary's list
      const currentActivities = get().activities;
      const itineraryActivities = currentActivities[data.itinerary_id] || [];
      
      set({
        activities: {
          ...currentActivities,
          [data.itinerary_id]: [...itineraryActivities, newActivity]
        }
      });
      
      return newActivity;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create activity';
      set({ error: message });
      console.error('Error creating activity:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateActivity: async (id: string, data: UpdateActivityData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedActivity = await updateActivityFromApi(id, data);
      
      // Update the activity in the appropriate itinerary's list
      const currentActivities = get().activities;
      const itineraryActivities = currentActivities[updatedActivity.itinerary_id] || [];
      
      set({
        activities: {
          ...currentActivities,
          [updatedActivity.itinerary_id]: itineraryActivities.map(activity =>
            activity.id === id ? updatedActivity : activity
          )
        }
      });
      
      return updatedActivity;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update activity';
      set({ error: message });
      console.error('Error updating activity:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteActivity: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // First find which itinerary this activity belongs to
      const currentActivities = get().activities;
      let itineraryId: string | null = null;
      
      for (const [itinId, activities] of Object.entries(currentActivities)) {
        if (activities.find(a => a.id === id)) {
          itineraryId = itinId;
          break;
        }
      }
      
      if (!itineraryId) {
        throw new Error('Activity not found in any itinerary');
      }
      
      await deleteActivityFromApi(id);
      
      // Remove the activity from the list
      set({
        activities: {
          ...currentActivities,
          [itineraryId]: currentActivities[itineraryId].filter(activity => activity.id !== id)
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete activity';
      set({ error: message });
      console.error('Error deleting activity:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  getActivitiesForItinerary: (itineraryId: string) => {
    return get().activities[itineraryId] || [];
  },
  
  getActivityById: (id: string) => {
    const allActivities = get().activities;
    for (const activities of Object.values(allActivities)) {
      const found = activities.find(activity => activity.id === id);
      if (found) return found;
    }
    return undefined;
  }
}));