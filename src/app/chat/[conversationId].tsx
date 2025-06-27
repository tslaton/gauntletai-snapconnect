/**
 * @file Dynamic route for individual chat conversations
 * Uses the ChatScreen component to display a specific conversation
 */

import MessagesScreen from '@/components/MessagesScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

/**
 * Dynamic route component for individual chat conversations
 * Accessed via /chat/[conversationId]
 * 
 * @returns JSX element for the chat screen
 */
export default function ChatRoute() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  // Validate conversation ID parameter
  if (!conversationId || typeof conversationId !== 'string') {
    Alert.alert('Error', 'Invalid conversation ID');
    return null;
  }

  return <MessagesScreen conversationId={conversationId} />;
} 