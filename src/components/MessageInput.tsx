/**
 * @file MessageInput component for composing and sending messages in chat conversations
 * Provides a text input field with send button, character limit, and error handling
 */

import { type CreateMessageData } from '@/api/messages';
import { useMessagesStore } from '@/stores/messages';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Props for the MessageInput component
 */
interface MessageInputProps {
  /** The ID of the conversation to send messages to */
  conversationId: string;
  /** The current user's ID */
  currentUserId: string;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether the input should be disabled */
  disabled?: boolean;
  /** Callback when a message is successfully sent */
  onMessageSent?: () => void;
}

/**
 * Message content validation constants
 */
const MESSAGE_LIMITS = {
  MAX_CONTENT_LENGTH: 2000,
} as const;

/**
 * Component for composing and sending messages with text input and send button
 * 
 * @param props - Component props
 * @returns JSX element for message input interface
 */
export default function MessageInput({
  conversationId,
  currentUserId,
  placeholder = "Type a message...",
  disabled = false,
  onMessageSent,
}: MessageInputProps) {
  const [messageText, setMessageText] = useState('');
  const [showCharacterCount, setShowCharacterCount] = useState(false);

  // Get store state and actions
  const {
    sendMessage,
    sendingState,
  } = useMessagesStore();

  /**
   * Validates message content before sending
   */
  const validateMessage = (content: string): { isValid: boolean; error?: string } => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmedContent.length > MESSAGE_LIMITS.MAX_CONTENT_LENGTH) {
      return {
        isValid: false,
        error: `Message cannot exceed ${MESSAGE_LIMITS.MAX_CONTENT_LENGTH} characters`,
      };
    }

    return { isValid: true };
  };

  /**
   * Handles sending a message
   */
  const handleSendMessage = async () => {
    // Validate inputs
    if (!conversationId || !currentUserId) {
      Alert.alert('Error', 'Invalid conversation or user');
      return;
    }

    // Validate message content
    const validation = validateMessage(messageText);
    if (!validation.isValid) {
      Alert.alert('Invalid Message', validation.error);
      return;
    }

    const messageData: CreateMessageData = {
      conversationId,
      content: messageText.trim(),
      type: 'text',
    };

    try {
      const result = await sendMessage(messageData, currentUserId);

      if (result.success) {
        // Clear input and notify parent
        setMessageText('');
        setShowCharacterCount(false);
        onMessageSent?.();
      } else {
        // Show error to user
        Alert.alert('Send Failed', result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  /**
   * Handles text input changes with character limit monitoring
   */
  const handleTextChange = (text: string) => {
    setMessageText(text);
    
    // Show character count when approaching limit
    const shouldShowCount = text.length > MESSAGE_LIMITS.MAX_CONTENT_LENGTH * 0.8;
    setShowCharacterCount(shouldShowCount);
  };

  /**
   * Show sending errors when they occur
   */
  useEffect(() => {
    if (sendingState.error) {
      Alert.alert('Send Error', sendingState.error);
    }
  }, [sendingState.error]);

  /**
   * Determines if send button should be disabled
   */
  const isSendDisabled = () => {
    return (
      disabled ||
      sendingState.isSending ||
      !messageText.trim() ||
      messageText.length > MESSAGE_LIMITS.MAX_CONTENT_LENGTH
    );
  };

  /**
   * Gets the color for the character count display
   */
  const getCharacterCountColor = () => {
    const length = messageText.length;
    const limit = MESSAGE_LIMITS.MAX_CONTENT_LENGTH;
    
    if (length > limit) return '#EF4444'; // Red for over limit
    if (length > limit * 0.9) return '#F59E0B'; // Amber for warning
    return '#6B7280'; // Gray for normal
  };

  /**
   * Renders the character count display
   */
  const renderCharacterCount = () => {
    if (!showCharacterCount && messageText.length <= MESSAGE_LIMITS.MAX_CONTENT_LENGTH) {
      return null;
    }

    const characterCount = messageText.length;
    const isOverLimit = characterCount > MESSAGE_LIMITS.MAX_CONTENT_LENGTH;

    return (
      <View className="px-3 pb-2">
        <Text 
          className="text-xs text-right"
          style={{ color: getCharacterCountColor() }}
        >
          {characterCount}/{MESSAGE_LIMITS.MAX_CONTENT_LENGTH}
          {isOverLimit && ' - Message too long'}
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white border-t border-gray-200">
      {/* Character count display */}
      {renderCharacterCount()}
      
      {/* Input container */}
      <View className="flex-row items-end px-4 py-3">
        {/* Text input */}
        <View className="flex-1 mr-3">
          <TextInput
            className={`border border-gray-300 rounded-2xl px-4 py-3 text-base max-h-24 ${
              disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'
            }`}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            scrollEnabled
            editable={!disabled && !sendingState.isSending}
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="default"
            blurOnSubmit={false}
            onSubmitEditing={({ nativeEvent }) => {
              // Send message on Enter key (single line) if not shift+enter
              if (!nativeEvent.text.includes('\n') && messageText.trim() && !isSendDisabled()) {
                handleSendMessage();
              }
            }}
            style={{
              minHeight: 44, // Ensure minimum touch target size
              textAlignVertical: 'center',
            }}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          className={`w-11 h-11 rounded-full items-center justify-center ${
            isSendDisabled()
              ? 'bg-gray-300'
              : 'bg-blue-600 active:bg-blue-700'
          }`}
          onPress={handleSendMessage}
          disabled={isSendDisabled()}
          activeOpacity={0.7}
        >
          {sendingState.isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome 
              name="send" 
              size={16} 
              color={isSendDisabled() ? '#9CA3AF' : 'white'} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 