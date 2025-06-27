/**
 * @file ChatScreen component for displaying individual chat conversations
 * Integrates message display, input, and conversation management with real-time updates
 */

import { type ConversationWithDetails } from '@/api/messages';
import { useConversationsStore } from '@/stores/conversations';
import { useMessagesStore } from '@/stores/messages';
import { useUserStore } from '@/stores/user';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

/**
 * Props for the ChatScreen component
 */
interface ChatScreenProps {
  /** The ID of the conversation to display */
  conversationId: string;
}

/**
 * Component for displaying a chat conversation with messages and input
 * 
 * @param props - Component props
 * @returns JSX element for chat screen interface
 */
export default function ChatScreen({ conversationId }: ChatScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get stores
  const { currentUser } = useUserStore();
  const {
    getConversationById,
    refreshConversation,
  } = useConversationsStore();

  const {
    getConversationMessages,
    isConversationLoading,
    getConversationError,
    hasMoreMessages,
    isLoadingMoreMessages,
    fetchMessages,
    subscribeToConversation,
    unsubscribeFromConversation,
    markAsRead,
  } = useMessagesStore();

  // Get conversation and messages data
  const conversation = getConversationById(conversationId);
  const messages = getConversationMessages(conversationId);
  const isLoading = isConversationLoading(conversationId);
  const error = getConversationError(conversationId);

  /**
   * Gets the conversation title for display
   */
  const getConversationTitle = (conv: ConversationWithDetails): string => {
    if (conv.type === 'group') {
      return conv.title || 'Group Chat';
    }

    // For direct conversations, show the other participant's name
    const otherParticipant = conv.participants.find(p => p.userId !== currentUser?.id);
    if (otherParticipant) {
      return otherParticipant.user.fullName || otherParticipant.user.username || 'Unknown User';
    }

    return 'Direct Chat';
  };

  /**
   * Gets the conversation subtitle (participant count for groups)
   */
  const getConversationSubtitle = (conv: ConversationWithDetails): string | null => {
    if (conv.type === 'group') {
      const participantCount = conv.participants.length;
      return `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
    }
    return null;
  };

  /**
   * Scrolls to the bottom of the message list
   */
  const scrollToBottom = useCallback((animated: boolean = true) => {
    if (flatListRef.current && messages.length > 0) {
      try {
        flatListRef.current.scrollToIndex({ 
          index: 0, 
          animated,
          viewPosition: 0 
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        flatListRef.current.scrollToOffset({ offset: 0, animated });
      }
    }
  }, [messages.length]);

  /**
   * Handles loading more messages (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (!currentUser?.id || !hasMoreMessages(conversationId) || isLoadingMoreMessages(conversationId)) {
      return;
    }

    fetchMessages(conversationId, currentUser.id, true);
  }, [conversationId, currentUser?.id, hasMoreMessages, isLoadingMoreMessages, fetchMessages]);

  /**
   * Handles when a message is sent - scroll to bottom and mark as read
   */
  const handleMessageSent = useCallback(() => {
    scrollToBottom(true);
    if (currentUser?.id) {
      markAsRead(conversationId, currentUser.id);
    }
  }, [conversationId, currentUser?.id, markAsRead, scrollToBottom]);

  /**
   * Initial data loading
   */
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadInitialData = async () => {
      // Refresh conversation details if not already loaded
      if (!conversation) {
        await refreshConversation(conversationId, currentUser.id);
      }

      // Fetch messages
      await fetchMessages(conversationId, currentUser.id);
      
      // Mark messages as read
      await markAsRead(conversationId, currentUser.id);
      
      setIsInitialLoad(false);
    };

    loadInitialData();
  }, [conversationId, currentUser?.id]);

  /**
   * Set up real-time subscriptions
   */
  useEffect(() => {
    if (!currentUser?.id) return;

    subscribeToConversation(conversationId, currentUser.id);

    return () => {
      unsubscribeFromConversation(conversationId);
    };
  }, [conversationId, currentUser?.id, subscribeToConversation, unsubscribeFromConversation]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      // Small delay to ensure render is complete
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages.length, isInitialLoad, scrollToBottom]);

  /**
   * Mark messages as read when screen becomes active
   */
  useEffect(() => {
    if (currentUser?.id && messages.length > 0) {
      markAsRead(conversationId, currentUser.id);
    }
  }, [conversationId, currentUser?.id, messages.length, markAsRead]);

  /**
   * Renders the header with conversation info and navigation
   */
  const renderHeader = () => {
    const title = conversation ? getConversationTitle(conversation) : 'Loading...';
    const subtitle = conversation ? getConversationSubtitle(conversation) : null;

    return (
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>
          
          {/* Conversation Info */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {/* Options Button (for future features) */}
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to conversation settings/info
              Alert.alert('Info', 'Conversation settings coming soon!');
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <FontAwesome name="info-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Renders a message item in the FlatList
   */
  const renderMessage = ({ item: message }: { item: any }) => {
    if (!currentUser?.id) return null;

    return (
      <MessageBubble
        message={message}
        currentUserId={currentUser.id}
        showAvatar={conversation?.type === 'group'}
        showSenderName={conversation?.type === 'group'}
      />
    );
  };

  /**
   * Renders the loading more indicator at the top
   */
  const renderLoadMoreIndicator = () => {
    if (!isLoadingMoreMessages(conversationId)) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="text-gray-500 text-sm mt-2">Loading more messages...</Text>
      </View>
    );
  };

  /**
   * Renders the empty state when no messages
   */
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading messages...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="comments" size={64} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
          Start the conversation
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          Send the first message to begin chatting
        </Text>
      </View>
    );
  };

  /**
   * Renders the error state
   */
  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-triangle" size={64} color="#EF4444" />
      <Text className="text-red-600 font-semibold text-lg mt-4 text-center">
        Unable to load chat
      </Text>
      <Text className="text-gray-600 text-center mt-2 mb-4">
        {error}
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg active:bg-blue-700"
        onPress={() => {
          if (currentUser?.id) {
            fetchMessages(conversationId, currentUser.id);
          }
        }}
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = (item: any) => item.id;

  /**
   * Handles scroll to load more messages
   */
  const handleOnEndReached = () => {
    if (hasMoreMessages(conversationId) && !isLoadingMoreMessages(conversationId)) {
      handleLoadMore();
    }
  };

  // Show error state if there's an error and no messages
  if (error && messages.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <SafeAreaView className="flex-1">
          {renderHeader()}
          {renderError()}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}                          // it must stretch
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // header + status-bar
    >
      <SafeAreaView style={{ flex: 1 }}>
        {renderHeader()}

        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            inverted // Newest messages at bottom
            onEndReached={handleOnEndReached}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderLoadMoreIndicator}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1, justifyContent: 'flex-end' }}
          />
        )}

        <MessageInput
          conversationId={conversationId}
          currentUserId={currentUser!.id}
          placeholder={`Message ${getConversationTitle(conversation!)}…`}
          onMessageSent={handleMessageSent}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
} 