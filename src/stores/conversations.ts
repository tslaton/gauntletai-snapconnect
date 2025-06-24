/**
 * @file This file contains the Zustand store for managing conversations and conversation lists.
 * It handles conversation data, participant management, and conversation-related state management.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';
import {
    addParticipants as apiAddParticipants,
    createConversation as apiCreateConversation,
    fetchConversationById as apiFetchConversationById,
    fetchUserConversations as apiFetchUserConversations,
    getOrCreateDirectConversation as apiGetOrCreateDirectConversation,
    leaveConversation as apiLeaveConversation,
    type AddParticipantData,
    type CreateConversationData,
} from '../utils/conversationsApi';
import {
    type ConversationWithDetails,
} from '../utils/messagesApi';
import { supabase } from '../utils/supabase';

/**
 * Interface for conversation data (from API)
 */
export interface Conversation extends ConversationWithDetails {}

/**
 * Interface for conversation creation state
 */
interface ConversationCreationState {
  isCreating: boolean;
  error: string | null;
}

/**
 * Interface for conversation actions states
 */
interface ConversationActions {
  [conversationId: string]: {
    isLeaving?: boolean;
    isAddingParticipants?: boolean;
  };
}

/**
 * Interface for real-time subscription state
 */
interface ConversationsRealtimeState {
  subscriptions: Map<string, RealtimeChannel>; // userId -> channel
  isConnected: boolean;
}

/**
 * Interface for the Conversations store state and its actions
 */
interface ConversationsState {
  // Conversations list state
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
  
  // Conversation creation state
  creationState: ConversationCreationState;
  
  // Action states
  actionStates: ConversationActions;
  
  // Real-time state
  realtimeState: ConversationsRealtimeState;
  
  // Actions - Conversation Management
  fetchConversations: (currentUserId: string) => Promise<void>;
  createConversation: (conversationData: CreateConversationData, currentUserId: string) => Promise<{ success: boolean; conversation?: Conversation; error?: string }>;
  startDirectConversation: (currentUserId: string, friendId: string) => Promise<{ success: boolean; conversation?: Conversation; error?: string }>;
  refreshConversation: (conversationId: string, currentUserId: string) => Promise<void>;
  addParticipants: (addParticipantData: AddParticipantData, currentUserId: string) => Promise<{ success: boolean; error?: string }>;
  leaveConversation: (conversationId: string, currentUserId: string) => Promise<{ success: boolean; error?: string }>;
  clearConversations: () => void;
  clearError: () => void;
  
  // Actions - Real-time
  subscribeToConversationUpdates: (currentUserId: string) => void;
  unsubscribeFromConversationUpdates: (currentUserId: string) => void;
  unsubscribeFromAll: () => void;
  
  // Helper methods
  getConversationById: (conversationId: string) => Conversation | undefined;
  getTotalUnreadCount: () => number;
  isConversationActionInProgress: (conversationId: string, action: 'leaving' | 'addingParticipants') => boolean;
  getDirectConversationWithUser: (userId: string) => Conversation | undefined;
  sortConversationsByActivity: () => void;
}

/**
 * A Zustand store for managing conversations and conversation lists.
 *
 * @returns A store with state and actions for conversations management
 */
export const useConversationsStore = create<ConversationsState>((set, get) => ({
  // Initial state
  conversations: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  creationState: {
    isCreating: false,
    error: null,
  },
  actionStates: {},
  realtimeState: {
    subscriptions: new Map(),
    isConnected: false,
  },

  // --- CONVERSATION MANAGEMENT ACTIONS ---

  /**
   * Fetches the user's conversations list with details
   * 
   * @param currentUserId - The current user's ID
   */
  fetchConversations: async (currentUserId) => {
    const { isLoading } = get();
    
    // Don't fetch if already loading
    if (isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const conversations = await apiFetchUserConversations(currentUserId);
      
      // Sort conversations by last activity (most recent first)
      const sortedConversations = conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      set({ 
        conversations: sortedConversations, 
        isLoading: false,
        lastFetch: new Date().toISOString(),
        error: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
      console.error('Error fetching conversations:', error);
      set({ 
        error: message, 
        isLoading: false 
      });
    }
  },

  /**
   * Creates a new conversation (group or direct)
   * 
   * @param conversationData - The conversation data to create
   * @param currentUserId - The current user's ID
   * @returns Promise with success status and optional conversation/error
   */
  createConversation: async (conversationData, currentUserId) => {
    const { creationState } = get();

    // Don't create if already creating
    if (creationState.isCreating) {
      return { success: false, error: 'Another conversation is being created' };
    }

    set({
      creationState: {
        isCreating: true,
        error: null,
      },
    });

    try {
      const newConversation = await apiCreateConversation(conversationData, currentUserId);

      // Add conversation to local state
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        creationState: {
          isCreating: false,
          error: null,
        },
      }));

      return { success: true, conversation: newConversation };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create conversation';
      console.error('Error creating conversation:', error);
      
      set({
        creationState: {
          isCreating: false,
          error: message,
        },
      });

      return { success: false, error: message };
    }
  },

  /**
   * Starts or gets a direct conversation with a friend
   * 
   * @param currentUserId - The current user's ID
   * @param friendId - The friend's user ID
   * @returns Promise with success status and optional conversation/error
   */
  startDirectConversation: async (currentUserId, friendId) => {
    const { creationState } = get();

    // Don't create if already creating
    if (creationState.isCreating) {
      return { success: false, error: 'Another conversation is being created' };
    }

    set({
      creationState: {
        isCreating: true,
        error: null,
      },
    });

    try {
      const conversation = await apiGetOrCreateDirectConversation(currentUserId, friendId);

      // Check if conversation already exists in local state
      const { conversations } = get();
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);

      if (existingIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...conversations];
        updatedConversations[existingIndex] = conversation;
        
        set({
          conversations: updatedConversations,
          creationState: {
            isCreating: false,
            error: null,
          },
        });
      } else {
        // Add new conversation
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          creationState: {
            isCreating: false,
            error: null,
          },
        }));
      }

      return { success: true, conversation };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start conversation';
      console.error('Error starting direct conversation:', error);
      
      set({
        creationState: {
          isCreating: false,
          error: message,
        },
      });

      return { success: false, error: message };
    }
  },

  /**
   * Refreshes a specific conversation's details
   * 
   * @param conversationId - The conversation ID to refresh
   * @param currentUserId - The current user's ID
   */
  refreshConversation: async (conversationId, currentUserId) => {
    try {
      const updatedConversation = await apiFetchConversationById(conversationId, currentUserId);

      if (updatedConversation) {
        const { conversations } = get();
        const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);

        if (conversationIndex >= 0) {
          const updatedConversations = [...conversations];
          updatedConversations[conversationIndex] = updatedConversation;
          
          set({ conversations: updatedConversations });
        }
      }
    } catch (error) {
      console.error('Error refreshing conversation:', error);
    }
  },

  /**
   * Adds participants to a group conversation
   * 
   * @param addParticipantData - The participant data to add
   * @param currentUserId - The current user's ID
   * @returns Promise with success status and optional error message
   */
  addParticipants: async (addParticipantData, currentUserId) => {
    const { actionStates } = get();
    const conversationId = addParticipantData.conversationId;

    try {
      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [conversationId]: { 
            ...actionStates[conversationId], 
            isAddingParticipants: true 
          },
        },
      });

      await apiAddParticipants(addParticipantData, currentUserId);

      // Refresh the conversation to get updated participant list
      await get().refreshConversation(conversationId, currentUserId);

      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [conversationId]: { 
            ...state.actionStates[conversationId], 
            isAddingParticipants: false 
          },
        },
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add participants';
      console.error('Error adding participants:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [conversationId]: { 
            ...state.actionStates[conversationId], 
            isAddingParticipants: false 
          },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Leaves a group conversation
   * 
   * @param conversationId - The conversation ID to leave
   * @param currentUserId - The current user's ID
   * @returns Promise with success status and optional error message
   */
  leaveConversation: async (conversationId, currentUserId) => {
    const { actionStates } = get();

    try {
      // Set loading state
      set({
        actionStates: {
          ...actionStates,
          [conversationId]: { 
            ...actionStates[conversationId], 
            isLeaving: true 
          },
        },
      });

      await apiLeaveConversation(conversationId, currentUserId);

      // Remove conversation from local state
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        actionStates: {
          ...state.actionStates,
          [conversationId]: { 
            ...state.actionStates[conversationId], 
            isLeaving: false 
          },
        },
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave conversation';
      console.error('Error leaving conversation:', error);
      
      // Clear loading state
      set((state) => ({
        actionStates: {
          ...state.actionStates,
          [conversationId]: { 
            ...state.actionStates[conversationId], 
            isLeaving: false 
          },
        },
      }));

      return { success: false, error: message };
    }
  },

  /**
   * Clears conversations data
   */
  clearConversations: () => {
    const { realtimeState } = get();
    
    // Unsubscribe from all real-time channels
    realtimeState.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    set({ 
      conversations: [], 
      error: null,
      lastFetch: null,
      actionStates: {},
      creationState: {
        isCreating: false,
        error: null,
      },
      realtimeState: {
        subscriptions: new Map(),
        isConnected: false,
      },
    });
  },

  /**
   * Clears error state
   */
  clearError: () => {
    set({ error: null });
  },

  // --- REAL-TIME ACTIONS ---

  /**
   * Subscribes to real-time updates for conversation changes
   * 
   * @param currentUserId - The current user's ID
   */
  subscribeToConversationUpdates: (currentUserId) => {
    const { realtimeState } = get();

    // Don't subscribe if already subscribed
    if (realtimeState.subscriptions.has(currentUserId)) {
      return;
    }

    const channel = supabase
      .channel(`conversations:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const updatedConversation = payload.new as any;
          
          // Refresh the specific conversation to get full details
          get().refreshConversation(updatedConversation.id, currentUserId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newParticipant = payload.new as any;
          
          // Refresh conversations list when user is added to a new conversation
          get().fetchConversations(currentUserId);
        }
      )
      .subscribe();

    // Update subscriptions
    const newSubscriptions = new Map(realtimeState.subscriptions);
    newSubscriptions.set(currentUserId, channel);
    
    set({
      realtimeState: {
        ...realtimeState,
        subscriptions: newSubscriptions,
        isConnected: true,
      },
    });
  },

  /**
   * Unsubscribes from real-time updates for a user
   * 
   * @param currentUserId - The current user's ID
   */
  unsubscribeFromConversationUpdates: (currentUserId) => {
    const { realtimeState } = get();
    const channel = realtimeState.subscriptions.get(currentUserId);

    if (channel) {
      supabase.removeChannel(channel);
      
      const newSubscriptions = new Map(realtimeState.subscriptions);
      newSubscriptions.delete(currentUserId);
      
      set({
        realtimeState: {
          ...realtimeState,
          subscriptions: newSubscriptions,
          isConnected: newSubscriptions.size > 0,
        },
      });
    }
  },

  /**
   * Unsubscribes from all real-time updates
   */
  unsubscribeFromAll: () => {
    const { realtimeState } = get();
    
    realtimeState.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    set({
      realtimeState: {
        subscriptions: new Map(),
        isConnected: false,
      },
    });
  },

  // --- HELPER METHODS ---

  /**
   * Gets a conversation by its ID
   * 
   * @param conversationId - The conversation ID
   * @returns The conversation object or undefined
   */
  getConversationById: (conversationId) => {
    const { conversations } = get();
    return conversations.find(conv => conv.id === conversationId);
  },

  /**
   * Gets the total unread count across all conversations
   * 
   * @returns Total unread message count
   */
  getTotalUnreadCount: () => {
    const { conversations } = get();
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },

  /**
   * Checks if a conversation action is in progress
   * 
   * @param conversationId - The conversation ID
   * @param action - The action to check
   * @returns Whether the action is in progress
   */
  isConversationActionInProgress: (conversationId, action) => {
    const { actionStates } = get();
    const state = actionStates[conversationId];
    
    switch (action) {
      case 'leaving':
        return state?.isLeaving || false;
      case 'addingParticipants':
        return state?.isAddingParticipants || false;
      default:
        return false;
    }
  },

  /**
   * Gets a direct conversation with a specific user
   * 
   * @param userId - The other user's ID
   * @returns The conversation object or undefined
   */
  getDirectConversationWithUser: (userId) => {
    const { conversations } = get();
    return conversations.find(conv => 
      conv.type === 'direct' && 
      conv.participants.some(p => p.userId === userId)
    );
  },

  /**
   * Sorts conversations by last activity
   */
  sortConversationsByActivity: () => {
    const { conversations } = get();
    const sortedConversations = [...conversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    set({ conversations: sortedConversations });
  },
})); 