/**
 * @file MessageBubble component for displaying individual messages in chat conversations
 * Handles different styling for sent vs received messages, timestamps, and sender avatars
 */

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { type MessageWithSender } from '../utils/messagesApi';

/**
 * Props for the MessageBubble component
 */
interface MessageBubbleProps {
  /** The message data to display */
  message: MessageWithSender;
  /** The current user's ID to determine if message is sent or received */
  currentUserId: string;
  /** Whether to show the sender's avatar (typically only for received messages in groups) */
  showAvatar?: boolean;
  /** Whether to show the sender's name (typically only for received messages in groups) */
  showSenderName?: boolean;
}

/**
 * Component for displaying individual message bubbles with sent/received styling
 * 
 * @param props - Component props
 * @returns JSX element for message bubble
 */
export default function MessageBubble({
  message,
  currentUserId,
  showAvatar = false,
  showSenderName = false,
}: MessageBubbleProps) {
  const isSentByCurrentUser = message.senderId === currentUserId;

  /**
   * Formats the message timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    // If less than 24 hours ago, show time only
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // If more than 24 hours ago, show date and time
    return messageTime.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Renders the sender's avatar for received messages
   */
  const renderAvatar = () => {
    if (!showAvatar || isSentByCurrentUser) {
      return <View className="w-8 h-8" />; // Placeholder for alignment
    }

    if (message.sender.avatarUrl) {
      return (
        <Image
          source={{ uri: message.sender.avatarUrl }}
          className="w-8 h-8 rounded-full mr-2"
          resizeMode="cover"
        />
      );
    }

    return (
      <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-2">
        <FontAwesome name="user" size={12} color="#6B7280" />
      </View>
    );
  };

  /**
   * Renders the sender's name for received messages in group chats
   */
  const renderSenderName = () => {
    if (!showSenderName || isSentByCurrentUser) {
      return null;
    }

    const displayName = message.sender.fullName || message.sender.username || 'Unknown User';
    
    return (
      <Text className="text-xs text-gray-500 mb-1 ml-1">
        {displayName}
      </Text>
    );
  };

  /**
   * Renders the message content based on type
   */
  const renderMessageContent = () => {
    if (message.type === 'photo') {
      // TODO: Handle photo display when photo messaging is implemented
      return (
        <View className="bg-gray-100 p-3 rounded-lg items-center">
          <FontAwesome name="image" size={20} color="#6B7280" />
          <Text className="text-gray-500 text-sm mt-1">Photo</Text>
        </View>
      );
    }

    return (
      <Text 
        className={`text-base ${
          isSentByCurrentUser ? 'text-white' : 'text-gray-900'
        }`}
        selectable
      >
        {message.content}
      </Text>
    );
  };

  /**
   * Renders the timestamp below the message
   */
  const renderTimestamp = () => {
    const timestamp = formatTimestamp(message.createdAt);
    
    return (
      <Text 
        className={`text-xs mt-1 ${
          isSentByCurrentUser 
            ? 'text-right text-gray-400' 
            : 'text-left text-gray-500'
        }`}
      >
        {timestamp}
      </Text>
    );
  };

  return (
    <View 
      className={`flex-row mb-4 ${
        isSentByCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for received messages */}
      {!isSentByCurrentUser && renderAvatar()}
      
      {/* Message container */}
      <View 
        className={`max-w-[80%] ${
          isSentByCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name for received messages in groups */}
        {renderSenderName()}
        
        {/* Message bubble */}
        <View
          className={`px-4 py-3 rounded-2xl ${
            isSentByCurrentUser
              ? 'bg-blue-600 rounded-br-md'
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          {renderMessageContent()}
        </View>
        
        {/* Timestamp */}
        {renderTimestamp()}
      </View>
      
      {/* Spacer for sent messages to maintain alignment */}
      {isSentByCurrentUser && <View className="w-8 h-8" />}
    </View>
  );
} 