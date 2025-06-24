/**
 * @file This file contains the Zustand store for managing messages and real-time updates.
 * It handles message data, real-time subscriptions, and message-related state management.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';
import {
    fetchMessages as apiFetchMessages,
    getUnreadMessageCount as apiGetUnreadMessageCount,
    markMessagesAsRead as apiMarkMessagesAsRead,
    sendMessage as apiSendMessage,
    type CreateMessageData,
    type MessageWithSender,
} from '../utils/messagesApi';
import { supabase } from '../utils/supabase';

/**
 * Interface for message data (from API)
 */
export interface Message extends MessageWithSender {}

/**
 * Interface for conversation messages state
 */
interface ConversationMessages {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean; // For pagination
  isLoadingMore: boolean;
  lastFetch: string | null; // Timestamp of last fetch for pagination
  unreadCount: number;
  isMarkingAsRead: boolean;
}

/**
 * Interface for message sending state
 */
interface MessageSendingState {
  isSending: boolean;
  error: string | null;
}

/**
 * Interface for real-time subscription state
 */
interface RealtimeState {
  subscriptions: Map<string, RealtimeChannel>; // conversationId -> channel
  isConnected: boolean;
}

/**
 * Interface for the Messages store state and its actions
 */
interface MessagesState {
  // Messages data by conversation ID
  conversationMessages: Record<string, ConversationMessages>;
  
  // Message sending state
  sendingState: MessageSendingState;
  
  // Real-time state
  realtimeState: RealtimeState;
  
  // Actions - Message Management
  fetchMessages: (conversationId: string, currentUserId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (messageData: CreateMessageData, currentUserId: string) => Promise<{ success: boolean; error?: string }>;
  markAsRead: (conversationId: string, currentUserId: string) => Promise<void>;
  clearConversationMessages: (conversationId: string) => void;
  clearAllMessages: () => void;
  
  // Actions - Real-time
  subscribeToConversation: (conversationId: string, currentUserId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  unsubscribeFromAll: () => void;
  
  // Helper methods
  getConversationMessages: (conversationId: string) => Message[];
  isConversationLoading: (conversationId: string) => boolean;
  getConversationError: (conversationId: string) => string | null;
  getUnreadCount: (conversationId: string) => number;
  hasMoreMessages: (conversationId: string) => boolean;
  isLoadingMoreMessages: (conversationId: string) => boolean;
}

/**
 * Initial state for a conversation's messages
 */
const createInitialConversationState = (): ConversationMessages => ({
  messages: [],
  isLoading: false,
  error: null,
  hasMore: true,
  isLoadingMore: false,
  lastFetch: null,
  unreadCount: 0,
  isMarkingAsRead: false,
});

/**
 * A Zustand store for managing messages and real-time updates.
 *
 * @returns A store with state and actions for messages management
 */
export const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  conversationMessages: {},
  sendingState: {
    isSending: false,
    error: null,
  },
  realtimeState: {
    subscriptions: new Map(),
    isConnected: false,
  },

  // --- MESSAGE MANAGEMENT ACTIONS ---

  /**
   * Fetches messages for a conversation with pagination support
   * 
   * @param conversationId - The conversation ID to fetch messages for
   * @param currentUserId - The current user's ID
   * @param loadMore - Whether this is a pagination request (load older messages)
   */
  fetchMessages: async (conversationId, currentUserId, loadMore = false) => {
    const { conversationMessages } = get();
    const currentState = conversationMessages[conversationId] || createInitialConversationState();

    // Don't fetch if already loading or no more messages available for pagination
    if ((!loadMore && currentState.isLoading) || 
        (loadMore && (currentState.isLoadingMore || !currentState.hasMore))) {
      return;
    }

    // Set loading state
    set({
      conversationMessages: {
        ...conversationMessages,
        [conversationId]: {
          ...currentState,
          isLoading: !loadMore,
          isLoadingMore: loadMore,
          error: null,
        },
      },
    });

    try {
      // Fetch messages with pagination
      const beforeTimestamp = loadMore ? (currentState.lastFetch || undefined) : undefined;
      const newMessages = await apiFetchMessages(conversationId, currentUserId, 50, beforeTimestamp);
      
      // Fetch unread count
      const unreadCount = await apiGetUnreadMessageCount(conversationId, currentUserId);

      // Filter out expired messages (client-side safety check)
      const now = new Date();
      const validMessages = newMessages.filter(msg => new Date(msg.expiresAt) > now);

      // Determine pagination state
      const hasMore = validMessages.length === 50; // If we got a full page, there might be more
      const oldestMessageTime = validMessages.length > 0 
        ? validMessages[validMessages.length - 1].createdAt 
        : currentState.lastFetch;

      // Update state
      set({
        conversationMessages: {
          ...get().conversationMessages,
          [conversationId]: {
            ...currentState,
            messages: loadMore 
              ? [...currentState.messages, ...validMessages]
              : validMessages,
            isLoading: false,
            isLoadingMore: false,
            hasMore,
            lastFetch: oldestMessageTime,
            unreadCount,
            error: null,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages';
      console.error('Error fetching messages:', error);
      
      set({
        conversationMessages: {
          ...get().conversationMessages,
          [conversationId]: {
            ...currentState,
            isLoading: false,
            isLoadingMore: false,
            error: message,
          },
        },
      });
    }
  },

  /**
   * Sends a message with optimistic updates
   * 
   * @param messageData - The message data to send
   * @param currentUserId - The current user's ID
   * @returns Promise with success status and optional error message
   */
  sendMessage: async (messageData, currentUserId) => {
    const { conversationMessages, sendingState } = get();

    // Don't send if already sending
    if (sendingState.isSending) {
      return { success: false, error: 'Another message is being sent' };
    }

    // Set sending state
    set({
      sendingState: {
        isSending: true,
        error: null,
      },
    });

    try {
      const sentMessage = await apiSendMessage(messageData, currentUserId);

      // Add message to local state (optimistic update)
      const currentState = conversationMessages[messageData.conversationId] || createInitialConversationState();
      
      set({
        conversationMessages: {
          ...conversationMessages,
          [messageData.conversationId]: {
            ...currentState,
            messages: [sentMessage, ...currentState.messages],
          },
        },
        sendingState: {
          isSending: false,
          error: null,
        },
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error sending message:', error);
      
      set({
        sendingState: {
          isSending: false,
          error: message,
        },
      });

      return { success: false, error: message };
    }
  },

  /**
   * Marks messages as read for a conversation
   * 
   * @param conversationId - The conversation ID
   * @param currentUserId - The current user's ID
   */
  markAsRead: async (conversationId, currentUserId) => {
    const { conversationMessages } = get();
    const currentState = conversationMessages[conversationId];

    if (!currentState || currentState.isMarkingAsRead) {
      return;
    }

    // Set marking as read state
    set({
      conversationMessages: {
        ...conversationMessages,
        [conversationId]: {
          ...currentState,
          isMarkingAsRead: true,
        },
      },
    });

    try {
      await apiMarkMessagesAsRead(conversationId, currentUserId);

      // Update unread count to 0
      set({
        conversationMessages: {
          ...get().conversationMessages,
          [conversationId]: {
            ...get().conversationMessages[conversationId],
            unreadCount: 0,
            isMarkingAsRead: false,
          },
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      set({
        conversationMessages: {
          ...get().conversationMessages,
          [conversationId]: {
            ...get().conversationMessages[conversationId],
            isMarkingAsRead: false,
          },
        },
      });
    }
  },

  /**
   * Clears messages for a specific conversation
   * 
   * @param conversationId - The conversation ID to clear
   */
  clearConversationMessages: (conversationId) => {
    const { conversationMessages } = get();
    const { [conversationId]: _, ...remainingConversations } = conversationMessages;
    
    set({
      conversationMessages: remainingConversations,
    });
  },

  /**
   * Clears all messages data
   */
  clearAllMessages: () => {
    const { realtimeState } = get();
    
    // Unsubscribe from all real-time channels
    realtimeState.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    set({
      conversationMessages: {},
      sendingState: {
        isSending: false,
        error: null,
      },
      realtimeState: {
        subscriptions: new Map(),
        isConnected: false,
      },
    });
  },

  // --- REAL-TIME ACTIONS ---

  /**
   * Subscribes to real-time updates for a conversation
   * 
   * @param conversationId - The conversation ID to subscribe to
   * @param currentUserId - The current user's ID
   */
  subscribeToConversation: (conversationId, currentUserId) => {
    const { realtimeState } = get();

    // Don't subscribe if already subscribed
    if (realtimeState.subscriptions.has(conversationId)) {
      return;
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          // Don't add our own messages (they're already added optimistically)
          if (newMessage.sender_id === currentUserId) {
            return;
          }

          // Fetch the complete message with sender info
          apiFetchMessages(conversationId, currentUserId, 1)
            .then((messages) => {
              if (messages.length > 0) {
                const latestMessage = messages[0];
                
                // Add to conversation messages if it's the new message
                if (latestMessage.id === newMessage.id) {
                  const { conversationMessages } = get();
                  const currentState = conversationMessages[conversationId] || createInitialConversationState();
                  
                  // Check if message already exists (prevent duplicates)
                  const existingMessage = currentState.messages.find(msg => msg.id === latestMessage.id);
                  if (!existingMessage) {
                    set({
                      conversationMessages: {
                        ...conversationMessages,
                        [conversationId]: {
                          ...currentState,
                          messages: [latestMessage, ...currentState.messages],
                          unreadCount: currentState.unreadCount + 1,
                        },
                      },
                    });
                  }
                }
              }
            })
            .catch((error) => {
              console.error('Error fetching new message details:', error);
            });
        }
      )
      .subscribe();

    // Update subscriptions
    const newSubscriptions = new Map(realtimeState.subscriptions);
    newSubscriptions.set(conversationId, channel);
    
    set({
      realtimeState: {
        ...realtimeState,
        subscriptions: newSubscriptions,
        isConnected: true,
      },
    });
  },

  /**
   * Unsubscribes from real-time updates for a conversation
   * 
   * @param conversationId - The conversation ID to unsubscribe from
   */
  unsubscribeFromConversation: (conversationId) => {
    const { realtimeState } = get();
    const channel = realtimeState.subscriptions.get(conversationId);

    if (channel) {
      supabase.removeChannel(channel);
      
      const newSubscriptions = new Map(realtimeState.subscriptions);
      newSubscriptions.delete(conversationId);
      
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
   * Gets messages for a specific conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Array of messages
   */
  getConversationMessages: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.messages || [];
  },

  /**
   * Checks if a conversation is loading
   * 
   * @param conversationId - The conversation ID
   * @returns Whether the conversation is loading
   */
  isConversationLoading: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.isLoading || false;
  },

  /**
   * Gets error for a specific conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Error message or null
   */
  getConversationError: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.error || null;
  },

  /**
   * Gets unread count for a specific conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Unread message count
   */
  getUnreadCount: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.unreadCount || 0;
  },

  /**
   * Checks if there are more messages to load for a conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Whether there are more messages
   */
  hasMoreMessages: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.hasMore || false;
  },

  /**
   * Checks if more messages are being loaded for a conversation
   * 
   * @param conversationId - The conversation ID
   * @returns Whether more messages are loading
   */
  isLoadingMoreMessages: (conversationId) => {
    const { conversationMessages } = get();
    return conversationMessages[conversationId]?.isLoadingMore || false;
  },
})); 