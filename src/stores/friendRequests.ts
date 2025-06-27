/**
 * @file This file contains the Zustand store for managing friend requests data and operations.
 * It provides centralized state management for friend request statuses and actions.
 */

import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchReceivedFriendRequests,
  fetchSentFriendRequests,
  sendFriendRequest,
  type FriendRequestWithUser,
} from '@/api/friends';
import { create } from 'zustand';

/**
 * Interface for friend request action states
 */
interface FriendRequestActions {
  [requestId: string]: {
    isAccepting?: boolean;
    isDeclining?: boolean;
    isSending?: boolean;
  };
}

/**
 * Interface for friend request validation errors
 */
export interface FriendRequestValidationError {
  type: 'duplicate' | 'self_request' | 'already_friends' | 'permission_denied' | 'not_found' | 'invalid_status';
  message: string;
}

/**
 * Interface for the Friend Requests store state and actions
 */
interface FriendRequestsState {
  // Data state
  receivedRequests: FriendRequestWithUser[];
  sentRequests: FriendRequestWithUser[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  actionStates: FriendRequestActions;
  
  // Error state
  error: string | null;
  validationErrors: FriendRequestValidationError[];
  
  // Actions
  loadFriendRequests: (currentUserId: string, isRefresh?: boolean) => Promise<void>;
  sendFriendRequestAction: (currentUserId: string, targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  acceptFriendRequestAction: (requestId: string, currentUserId: string) => Promise<{ success: boolean; error?: string }>;
  declineFriendRequestAction: (requestId: string, currentUserId: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  clearValidationErrors: () => void;
  
  // Status checking helpers
  isPendingRequest: (targetUserId: string, currentUserId: string) => boolean;
  getRequestStatus: (targetUserId: string, currentUserId: string) => 'none' | 'sent' | 'received' | 'friends';
  hasPermissionToAccept: (requestId: string, currentUserId: string) => boolean;
  hasPermissionToDecline: (requestId: string, currentUserId: string) => boolean;
}

/**
 * A Zustand store for managing friend requests data and operations.
 * This provides centralized state management for friend request statuses and validation.
 *
 * @returns A store with state and actions for friend request management
 */
export const useFriendRequestsStore = create<FriendRequestsState>((set, get) => ({
  // Initial state
  receivedRequests: [],
  sentRequests: [],
  isLoading: false,
  isRefreshing: false,
  actionStates: {},
  error: null,
  validationErrors: [],

  // --- ACTIONS ---

  /**
   * Loads friend requests from the server and updates the store
   * 
   * @param currentUserId - The current user's ID
   * @param isRefresh - Whether this is a refresh operation
   */
  loadFriendRequests: async (currentUserId: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }

      const [receivedData, sentData] = await Promise.all([
        fetchReceivedFriendRequests(currentUserId),
        fetchSentFriendRequests(currentUserId),
      ]);

      set({
        receivedRequests: receivedData,
        sentRequests: sentData,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load friend requests';
      console.error('Error loading friend requests:', error);
      set({
        error: message,
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  /**
   * Sends a friend request with validation
   * 
   * @param currentUserId - The current user's ID (sender)
   * @param targetUserId - The target user's ID (receiver)
   * @returns Promise with success status and optional error message
   */
  sendFriendRequestAction: async (currentUserId: string, targetUserId: string) => {
    const { getRequestStatus, actionStates } = get();
    
    try {
      // Validation checks
      if (currentUserId === targetUserId) {
        const error: FriendRequestValidationError = {
          type: 'self_request',
          message: 'You cannot send a friend request to yourself',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      const status = getRequestStatus(targetUserId, currentUserId);
      if (status === 'sent') {
        const error: FriendRequestValidationError = {
          type: 'duplicate',
          message: 'You have already sent a friend request to this user',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      if (status === 'received') {
        const error: FriendRequestValidationError = {
          type: 'duplicate',
          message: 'This user has already sent you a friend request',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      if (status === 'friends') {
        const error: FriendRequestValidationError = {
          type: 'already_friends',
          message: 'You are already friends with this user',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [targetUserId]: { ...actionStates[targetUserId], isSending: true },
        },
        validationErrors: [],
      });

      // Send the request
      const requestData = await sendFriendRequest(currentUserId, targetUserId);

      // Create the new request object for the UI
      const newSentRequest: FriendRequestWithUser = {
        id: requestData.id,
        requesterId: requestData.requesterId,
        addresseeId: requestData.addresseeId,
        status: requestData.status,
        createdAt: requestData.createdAt,
        updatedAt: requestData.updatedAt,
        requester: {
          id: targetUserId,
          username: null, // Will be populated when we refresh
          fullName: null,
          email: null,
          avatarUrl: null,
        },
      };

      // Add to sent requests
      set((state) => ({
        sentRequests: [newSentRequest, ...state.sentRequests],
        actionStates: {
          ...state.actionStates,
          [targetUserId]: { ...state.actionStates[targetUserId], isSending: false },
        },
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send friend request';
      console.error('Error sending friend request:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [targetUserId]: { ...state.actionStates[targetUserId], isSending: false },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Accepts a friend request with validation
   * 
   * @param requestId - The ID of the friend request to accept
   * @param currentUserId - The current user's ID (must be the addressee)
   * @returns Promise with success status and optional error message
   */
  acceptFriendRequestAction: async (requestId: string, currentUserId: string) => {
    const { hasPermissionToAccept, actionStates, receivedRequests } = get();
    
    try {
      // Validation checks
      if (!hasPermissionToAccept(requestId, currentUserId)) {
        const error: FriendRequestValidationError = {
          type: 'permission_denied',
          message: 'You do not have permission to accept this friend request',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      const request = receivedRequests.find(r => r.id === requestId);
      if (!request) {
        const error: FriendRequestValidationError = {
          type: 'not_found',
          message: 'Friend request not found',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      if (request.status !== 'pending') {
        const error: FriendRequestValidationError = {
          type: 'invalid_status',
          message: 'This friend request is no longer pending',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [requestId]: { ...actionStates[requestId], isAccepting: true },
        },
        validationErrors: [],
      });

      // Accept the request
      await acceptFriendRequest(requestId, currentUserId);

      // Update request status to 'accepted' instead of removing it
      set((state) => {
        const updatedRequests = state.receivedRequests.map(r => 
          r.id === requestId 
            ? { ...r, status: 'accepted' as const, updatedAt: new Date().toISOString() }
            : r
        );
        
        return {
          receivedRequests: updatedRequests,
          actionStates: {
            ...state.actionStates,
            [requestId]: { ...state.actionStates[requestId], isAccepting: false },
          },
        };
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept friend request';
      console.error('Error accepting friend request:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [requestId]: { ...state.actionStates[requestId], isAccepting: false },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Declines a friend request with validation
   * 
   * @param requestId - The ID of the friend request to decline
   * @param currentUserId - The current user's ID (must be the addressee)
   * @returns Promise with success status and optional error message
   */
  declineFriendRequestAction: async (requestId: string, currentUserId: string) => {
    const { hasPermissionToDecline, actionStates, receivedRequests } = get();
    
    try {
      // Validation checks
      if (!hasPermissionToDecline(requestId, currentUserId)) {
        const error: FriendRequestValidationError = {
          type: 'permission_denied',
          message: 'You do not have permission to decline this friend request',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      const request = receivedRequests.find(r => r.id === requestId);
      if (!request) {
        const error: FriendRequestValidationError = {
          type: 'not_found',
          message: 'Friend request not found',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      if (request.status !== 'pending') {
        const error: FriendRequestValidationError = {
          type: 'invalid_status',
          message: 'This friend request is no longer pending',
        };
        set({ validationErrors: [error] });
        return { success: false, error: error.message };
      }

      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [requestId]: { ...actionStates[requestId], isDeclining: true },
        },
        validationErrors: [],
      });

      // Decline the request
      await declineFriendRequest(requestId, currentUserId);

      // Update request status to 'declined' instead of removing it
      set((state) => {
        const updatedRequests = state.receivedRequests.map(r => 
          r.id === requestId 
            ? { ...r, status: 'declined' as const, updatedAt: new Date().toISOString() }
            : r
        );
        
        return {
          receivedRequests: updatedRequests,
          actionStates: {
            ...state.actionStates,
            [requestId]: { ...state.actionStates[requestId], isDeclining: false },
          },
        };
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline friend request';
      console.error('Error declining friend request:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [requestId]: { ...state.actionStates[requestId], isDeclining: false },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Clears any existing error message from the state
   */
  clearError: () => set({ error: null }),

  /**
   * Clears validation errors from the state
   */
  clearValidationErrors: () => set({ validationErrors: [] }),

  // --- STATUS CHECKING HELPERS ---

  /**
   * Checks if there's a pending friend request with a specific user
   * 
   * @param targetUserId - The other user's ID
   * @param currentUserId - The current user's ID
   * @returns Whether there's a pending request between the users
   */
  isPendingRequest: (targetUserId: string, currentUserId: string) => {
    const { receivedRequests, sentRequests } = get();
    
    const hasSentRequest = sentRequests.some(
      request => request.addresseeId === targetUserId && request.status === 'pending'
    );
    
    const hasReceivedRequest = receivedRequests.some(
      request => request.requesterId === targetUserId && request.status === 'pending'
    );
    
    return hasSentRequest || hasReceivedRequest;
  },

  /**
   * Gets the relationship status with a specific user
   * 
   * @param targetUserId - The other user's ID
   * @param currentUserId - The current user's ID
   * @returns The relationship status
   */
  getRequestStatus: (targetUserId: string, currentUserId: string) => {
    const { receivedRequests, sentRequests } = get();
    
    // Check if current user sent a request to target user
    const sentRequest = sentRequests.find(
      request => request.addresseeId === targetUserId && request.status === 'pending'
    );
    if (sentRequest) return 'sent';
    
    // Check if target user sent a request to current user
    const receivedRequest = receivedRequests.find(
      request => request.requesterId === targetUserId && request.status === 'pending'
    );
    if (receivedRequest) return 'received';
    
    // Note: We can't check for 'friends' status here as this store
    // doesn't manage the friends list. That would be handled by the friends store.
    return 'none';
  },

  /**
   * Checks if the current user has permission to accept a friend request
   * 
   * @param requestId - The ID of the friend request
   * @param currentUserId - The current user's ID
   * @returns Whether the user can accept the request
   */
  hasPermissionToAccept: (requestId: string, currentUserId: string) => {
    const { receivedRequests } = get();
    const request = receivedRequests.find(r => r.id === requestId);
    return request?.addresseeId === currentUserId && request?.status === 'pending';
  },

  /**
   * Checks if the current user has permission to decline a friend request
   * 
   * @param requestId - The ID of the friend request
   * @param currentUserId - The current user's ID
   * @returns Whether the user can decline the request
   */
  hasPermissionToDecline: (requestId: string, currentUserId: string) => {
    const { receivedRequests } = get();
    const request = receivedRequests.find(r => r.id === requestId);
    return request?.addresseeId === currentUserId && request?.status === 'pending';
  },
})); 