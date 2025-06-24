/**
 * @file This file contains the Zustand store for managing friends data.
 * It handles friends list, search results, and related state management.
 */

import { create } from 'zustand';
import {
    fetchFriends as apiFetchFriends,
    removeFriend as apiRemoveFriend,
    searchFriends as apiSearchFriends,
    searchUsersWithStatus,
    type Friend as ApiFriend,
    type UserSearchResultWithStatus
} from '../utils/friendsApi';

/**
 * Interface for friend data (from API)
 */
export interface Friend extends ApiFriend {}

/**
 * Interface for friend actions states
 */
interface FriendActions {
  [friendId: string]: {
    isRemoving?: boolean;
  };
}

/**
 * Interface for the Friends store state and its actions
 */
interface FriendsState {
  // Friends list state
  friends: Friend[];
  isFriendsLoading: boolean;
  friendsError: string | null;
  friendsSearchQuery: string;
  actionStates: FriendActions;
  
  // Search state (for finding new users)
  searchResults: UserSearchResultWithStatus[];
  searchQuery: string;
  isSearchLoading: boolean;
  searchError: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  fetchSearchResults: (query: string, currentUserId: string) => Promise<void>;
  clearSearch: () => void;
  clearSearchError: () => void;
  
  // Friend management actions
  fetchFriends: (userId: string) => Promise<void>;
  searchFriends: (userId: string, query: string) => Promise<void>;
  removeFriend: (currentUserId: string, friendId: string) => Promise<{ success: boolean; error?: string }>;
  clearFriends: () => void;
  clearFriendsError: () => void;
  setFriendsSearchQuery: (query: string) => void;
  
  // Helper methods
  getFriendById: (friendId: string) => Friend | undefined;
  isFriendRemovalInProgress: (friendId: string) => boolean;
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
  friendsSearchQuery: '',
  actionStates: {},
  
  searchResults: [],
  searchQuery: '',
  isSearchLoading: false,
  searchError: null,

  // --- SEARCH ACTIONS (for finding new users) ---

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
    set({ isSearchLoading: true, searchError: null });

    try {
      const results = await searchUsersWithStatus(query, currentUserId);
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

  // --- FRIENDS ACTIONS ---

  /**
   * Fetches the user's friends list
   * 
   * @param userId - The user's ID
   */
  fetchFriends: async (userId) => {
    set({ isFriendsLoading: true, friendsError: null });
    
    try {
      const friends = await apiFetchFriends(userId);
      set({ friends, isFriendsLoading: false });
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
   * Searches through the user's friends list
   * 
   * @param userId - The user's ID
   * @param query - The search query
   */
  searchFriends: async (userId, query) => {
    set({ isFriendsLoading: true, friendsError: null, friendsSearchQuery: query });
    
    try {
      const friends = await apiSearchFriends(userId, query);
      set({ friends, isFriendsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search friends';
      console.error('Error searching friends:', error);
      set({ 
        friendsError: message, 
        isFriendsLoading: false 
      });
    }
  },

  /**
   * Removes a friend from the user's friends list
   * 
   * @param currentUserId - The current user's ID
   * @param friendId - The friend's user ID to remove
   * @returns Promise with success status and optional error message
   */
  removeFriend: async (currentUserId, friendId) => {
    const { actionStates } = get();
    
    try {
      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [friendId]: { ...actionStates[friendId], isRemoving: true },
        },
      });

      // Call API to remove friend
      await apiRemoveFriend(currentUserId, friendId);

      // Remove friend from local state
      set((state) => ({
        friends: state.friends.filter(friend => friend.friendId !== friendId),
        actionStates: {
          ...state.actionStates,
          [friendId]: { ...state.actionStates[friendId], isRemoving: false },
        },
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove friend';
      console.error('Error removing friend:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [friendId]: { ...state.actionStates[friendId], isRemoving: false },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Sets the friends search query
   * 
   * @param query - The search query string
   */
  setFriendsSearchQuery: (query) => {
    set({ friendsSearchQuery: query });
  },

  /**
   * Clears friends data
   */
  clearFriends: () => {
    set({ 
      friends: [], 
      friendsError: null,
      friendsSearchQuery: '',
      actionStates: {}
    });
  },

  /**
   * Clears friends error
   */
  clearFriendsError: () => {
    set({ friendsError: null });
  },

  // --- HELPER METHODS ---

  /**
   * Gets a friend by their user ID
   * 
   * @param friendId - The friend's user ID
   * @returns The friend object or undefined
   */
  getFriendById: (friendId) => {
    const { friends } = get();
    return friends.find(friend => friend.friendId === friendId);
  },

  /**
   * Checks if a friend removal is in progress
   * 
   * @param friendId - The friend's user ID
   * @returns Whether removal is in progress
   */
  isFriendRemovalInProgress: (friendId) => {
    const { actionStates } = get();
    return actionStates[friendId]?.isRemoving || false;
  },
})); 