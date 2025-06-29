/**
 * @file This file contains the Zustand store for managing user profile data.
 * It handles fetching, updating, and holding the state for the user's public profile.
 */

import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { useUserStore } from './user';

/**
 * Interface for the Profile store state and its actions.
 */
interface ProfileState {
  isLoading: boolean;
  error: string | null;
  username: string | null;
  website: string | null;
  avatarUrl: string | null;
  setUsername: (username: string) => void;
  setWebsite: (website: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  clearError: () => void;
  fetchProfile: (session: Session) => Promise<void>;
  saveProfile: (session: Session) => Promise<void>;
}

/**
 * A Zustand store for managing the user's profile.
 *
 * @returns A store with state and actions for profile management.
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  username: null,
  website: null,
  avatarUrl: null,

  // --- ACTIONS ---

  /**
   * Sets the username in the store.
   * @param {string} username - The new username.
   */
  setUsername: (username) => set({ username }),

  /**
   * Sets the website URL in the store.
   * @param {string} website - The new website URL.
   */
  setWebsite: (website) => set({ website }),

  /**
   * Sets the avatar URL in the store.
   * @param {string} avatarUrl - The new avatar URL.
   */
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),

  /**
   * Clears any existing error message from the state.
   */
  clearError: () => set({ error: null }),

  /**
   * Fetches the user's profile from the database and updates the store.
   * @param {Session} session - The user's current session object.
   */
  fetchProfile: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = session;
      if (!user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        // Batch state updates to avoid multiple re-renders
        set({
          username: data.username,
          website: data.website,
          avatarUrl: data.avatar_url,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Updates the user's profile in the database using the current store state.
   * @param {Session} session - The user's current session object.
   */
  saveProfile: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = session;
      if (!user) throw new Error('No user on the session!');

      // Get current state from the store for the update
      const { username, website, avatarUrl } = get();

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      
      // Sync the updated profile data to userStore so AvatarButton updates
      useUserStore.getState().updateUser({
        username,
        website,
        avatarUrl,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));