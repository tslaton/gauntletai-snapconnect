/**
 * @file Friends list screen for displaying the user's friends
 * Main screen for viewing and managing friends with search functionality
 */

import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import FriendsList from '../../components/FriendsList';
import { Friend } from '../../stores/friends';

/**
 * Main friends list screen component
 * 
 * @returns JSX element for the friends list screen
 */
export default function FriendsScreen() {
  /**
   * Handles when a friend is pressed (for future chat/profile navigation)
   */
  const handleFriendPress = (friend: Friend) => {
    console.log('Friend pressed:', friend.friend.fullName || friend.friend.username);
    // TODO: Navigate to friend's profile or start chat
    // router.push(`/chat/${friend.friendId}`);
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
          </View>
          
          {/* Add Friend Button */}
          <TouchableOpacity
            onPress={() => router.push('/friends/search')}
            className="w-10 h-10 items-center justify-center"
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
    </SafeAreaView>
  );
} 