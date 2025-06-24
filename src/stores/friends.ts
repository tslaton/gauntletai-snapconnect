/**
 * @file This file contains the Zustand store for managing friends data.
 * It handles friends list, search results, and related state management.
 */

import { create } from 'zustand';
import { searchUsers, type UserSearchResult } from '../utils/friendsApi';

/**
 * Interface for friend data (extends UserSearchResult)
 */
export interface Friend extends UserSearchResult {
  createdAt: string; // When friendship was established
}

/**
 * Interface for the Friends store state and its actions
 */
interface FriendsState {
  // Friends list state
  friends: Friend[];
  isFriendsLoading: boolean;
  friendsError: string | null;
  
  // Search state
  searchResults: UserSearchResult[];
  searchQuery: string;
  isSearchLoading: boolean;
  searchError: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  fetchSearchResults: (query: string, currentUserId: string) => Promise<void>;
  clearSearch: () => void;
  clearSearchError: () => void;
  
  // Friend management actions (placeholder for future implementation)
  fetchFriends: (userId: string) => Promise<void>;
  clearFriends: () => void;
  clearFriendsError: () => void;
}

/**
 * A Zustand store for managing friends and friend search functionality.
 *
 * @returns A store with state and actions for friends management
 */
export const useFriendsStore = create<FriendsState>((set, get) => ({
  // Initial state
  friends: [],
  isFriendsLoading: false,
  friendsError: null,
  
  searchResults: [],
  searchQuery: '',
  isSearchLoading: false,
  searchError: null,

  // --- SEARCH ACTIONS ---

  /**
   * Sets the search query in the store
   * 
   * @param query - The search query string
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  /**
   * Fetches user search results and updates search state
   * 
   * @param query - The search query string
   * @param currentUserId - The current user's ID to exclude from results
   */
  fetchSearchResults: async (query, currentUserId) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearchLoading: false });
      return;
    }

    set({ isSearchLoading: true, searchError: null });

    try {
      const results = await searchUsers(query, currentUserId);
      set({ 
        searchResults: results, 
        isSearchLoading: false,
        searchError: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search users';
      console.error('Error searching users:', error);
      set({ 
        searchError: message, 
        isSearchLoading: false,
        searchResults: []
      });
    }
  },

  /**
   * Clears search results and query
   */
  clearSearch: () => {
    set({ 
      searchResults: [], 
      searchQuery: '', 
      searchError: null,
      isSearchLoading: false
    });
  },

  /**
   * Clears search error
   */
  clearSearchError: () => {
    set({ searchError: null });
  },

  // --- FRIENDS ACTIONS (Placeholder for future implementation) ---

  /**
   * Fetches the user's friends list
   * 
   * @param userId - The user's ID
   */
  fetchFriends: async (userId) => {
    set({ isFriendsLoading: true, friendsError: null });
    
    try {
      // TODO: Implement actual friends API call
      // const friends = await getFriends(userId);
      // set({ friends, isFriendsLoading: false });
      
      // Placeholder implementation
      set({ friends: [], isFriendsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch friends';
      console.error('Error fetching friends:', error);
      set({ 
        friendsError: message, 
        isFriendsLoading: false 
      });
    }
  },

  /**
   * Clears friends data
   */
  clearFriends: () => {
    set({ 
      friends: [], 
      friendsError: null 
    });
  },

  /**
   * Clears friends error
   */
  clearFriendsError: () => {
    set({ friendsError: null });
  },
})); 