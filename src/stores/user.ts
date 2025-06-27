/**
 * @file This file contains the Zustand store for managing current user data.
 * It handles fetching and holding the state for the currently signed-in user.
 */

import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

/**
 * Interface for the current user data
 */
export interface CurrentUser {
  id: string;
  username: string | null;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  website: string | null;
}

/**
 * Interface for the User store state and its actions
 */
interface UserState {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  fetchCurrentUser: (session?: Session) => Promise<void>;
  clearUser: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<Omit<CurrentUser, 'id'>>) => void;
}

/**
 * A Zustand store for managing the current user's data.
 * This provides a single source of truth for current user information.
 *
 * @returns A store with state and actions for current user management
 */
export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  currentUser: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  // --- ACTIONS ---

  /**
   * Fetches the current user's profile from the database and updates the store.
   * Uses provided session or fetches current session if none provided.
   * 
   * @param session - Optional session object, will fetch current session if not provided
   */
  fetchCurrentUser: async (session) => {
    const { isInitialized } = get();
    
    // Don't refetch if already initialized and no session change
    if (isInitialized && !session) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      let userSession: Session | null = session || null;
      
      // Get current session if not provided
      if (!userSession) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }
        userSession = currentSession;
      }

      if (!userSession?.user) {
        // No user session, clear the store
        set({ 
          currentUser: null, 
          isLoading: false, 
          isInitialized: true 
        });
        return;
      }

      const { user } = userSession;

      // Fetch user profile data
      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, full_name, email, avatar_url, website')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist (404), create it with auth user email
      if (error && status === 406) {
        console.log('Profile not found, creating new profile for user:', user.id);
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || null,
            full_name: null,
            username: null,
            avatar_url: null,
            website: null,
          });

        if (createError) {
          console.error('Failed to create profile:', createError);
          
          // If it's a foreign key constraint error, the auth user doesn't exist
          // This can happen after a database reset - sign out the user
          if (createError.code === '23503') {
            console.log('Auth user no longer exists, signing out...');
            await supabase.auth.signOut();
            set({ 
              currentUser: null, 
              isLoading: false, 
              isInitialized: true,
              error: 'Session expired. Please sign in again.'
            });
            return;
          }
          // Continue anyway for other errors, we'll use auth data
        }

        // Use auth user data since profile was just created or failed to create
        const currentUser: CurrentUser = {
          id: user.id,
          username: null,
          fullName: null,
          email: user.email || null,
          avatarUrl: null,
          website: null,
        };

        set({ 
          currentUser, 
          isLoading: false, 
          isInitialized: true,
          error: null
        });
        return;
      }

      if (error && status !== 406) {
        throw error;
      }

      // Build current user object
      const currentUser: CurrentUser = {
        id: user.id,
        username: data?.username || null,
        fullName: data?.full_name || null,
        email: data?.email || user.email || null, // Fallback to auth email
        avatarUrl: data?.avatar_url || null,
        website: data?.website || null,
      };

      set({ 
        currentUser, 
        isLoading: false, 
        isInitialized: true,
        error: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user data';
      console.error('Error fetching current user:', error);
      set({ 
        error: message, 
        isLoading: false, 
        isInitialized: true 
      });
    }
  },

  /**
   * Clears the current user data from the store.
   * Used when user signs out.
   */
  clearUser: () => {
    set({ 
      currentUser: null, 
      error: null, 
      isInitialized: false 
    });
  },

  /**
   * Clears any existing error message from the state.
   */
  clearError: () => set({ error: null }),

  /**
   * Updates specific fields of the current user in the store.
   * Used for optimistic updates after profile changes.
   * 
   * @param updates - Partial user data to update
   */
  updateUser: (updates) => {
    const { currentUser } = get();
    if (currentUser) {
      set({
        currentUser: {
          ...currentUser,
          ...updates,
        },
      });
    }
  },
})); 