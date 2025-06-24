/**
 * @file Friends list screen for displaying the user's friends
 * Main screen for viewing and managing friends with search functionality
 */

import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import FriendsList from '../../components/FriendsList';
import { useConversationsStore } from '../../stores/conversations';
import { Friend } from '../../stores/friends';
import { useUserStore } from '../../stores/user';

/**
 * Main friends list screen component
 * 
 * @returns JSX element for the friends list screen
 */
export default function FriendsScreen() {
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  
  // Get stores
  const { currentUser } = useUserStore();
  const { startDirectConversation } = useConversationsStore();

  /**
   * Handles when a friend is pressed - starts a direct conversation and navigates to chat
   */
  const handleFriendPress = async (friend: Friend) => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please sign in to start a chat');
      return;
    }

    // Prevent multiple simultaneous chat starts
    if (isStartingChat) {
      return;
    }

    const friendName = friend.friend.fullName || friend.friend.username || 'this friend';
    setIsStartingChat(friend.friendId);

    try {
      // Start or get existing direct conversation
      const result = await startDirectConversation(currentUser.id, friend.friendId);

      if (result.success && result.conversation) {
        // Navigate to the chat screen
        router.push(`/chat/${result.conversation.id}` as any);
      } else {
        Alert.alert(
          'Chat Error', 
          result.error || `Failed to start chat with ${friendName}. Please try again.`
        );
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert(
        'Chat Error', 
        `Unable to start chat with ${friendName}. Please check your connection and try again.`
      );
    } finally {
      setIsStartingChat(null);
    }
  };

  /**
   * Renders a friend item with loading state during chat start
   */
  const renderFriendItem = (friend: Friend, onPress: (friend: Friend) => void) => {
    const isCurrentlyStarting = isStartingChat === friend.friendId;
    
    return (
      <TouchableOpacity
        className={`bg-white p-4 border-b border-gray-200 flex-row items-center ${
          isCurrentlyStarting ? 'opacity-60' : ''
        }`}
        onPress={() => onPress(friend)}
        disabled={isCurrentlyStarting || !!isStartingChat}
      >
        {/* This would be rendered by FriendsList's internal logic */}
        {isCurrentlyStarting && (
          <View className="absolute right-4 top-1/2 -mt-2">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>
          
          {/* Title */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Friends</Text>
            {isStartingChat && (
              <Text className="text-sm text-blue-600">Starting chat...</Text>
            )}
          </View>
          
          {/* Add Friend Button */}
          <TouchableOpacity
            onPress={() => router.push('/friends/search')}
            className="w-10 h-10 items-center justify-center"
            disabled={!!isStartingChat}
          >
            <FontAwesome name="user-plus" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Friends List */}
      <FriendsList 
        onFriendPress={handleFriendPress}
        showSearch={true}
        emptyMessage="You don't have any friends yet. Start by searching for people you know!"
      />

      {/* Loading overlay when starting chat */}
      {isStartingChat && (
        <View className="absolute inset-0 bg-black bg-opacity-20 items-center justify-center">
          <View className="bg-white rounded-lg p-6 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-700 mt-3">Starting conversation...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
} 