/**
 * @file MessageBubble component for displaying individual messages in chat conversations
 * Handles different styling for sent vs received messages, timestamps, and sender avatars
 */

import { type MessageWithSender } from '@/api/messages';
import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { Image, Text, View } from 'react-native';
import UserAvatar from './UserAvatar';

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
  const colors = useThemeColors();

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

    return <UserAvatar uri={message.sender.avatarUrl} size={32} className="mr-2" />;
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
      <Text className="text-xs mb-1 ml-1" style={{ color: colors.mutedForeground }}>
        {displayName}
      </Text>
    );
  };

  /**
   * Renders the message content based on type
   */
  const renderMessageContent = () => {
    if (message.type === 'photo') {
      // Display actual photo for photo messages
      return (
        <View>
          <Image
            source={{ uri: message.content }}
            className="w-48 h-48 rounded-lg"
            resizeMode="cover"
            style={{
              minHeight: 150,
              minWidth: 150,
            }}
          />
        </View>
      );
    }

    return (
      <Text 
        className="text-base"
        style={{ color: isSentByCurrentUser ? colors.primaryForeground : colors.foreground }}
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
            ? 'text-right' 
            : 'text-left'
        }`}
        style={{ color: colors.mutedForeground }}
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
              ? 'rounded-br-md'
              : 'rounded-bl-md'
          }`}
          style={{ 
            backgroundColor: isSentByCurrentUser ? colors.primary : colors.secondary 
          }}
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