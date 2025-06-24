/**
 * @file UserSearchResult component for displaying individual user search results
 * Provides a reusable component for showing user information with friend request action
 */

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { type UserSearchResultWithStatus } from '../utils/friendsApi';

/**
 * Props for the UserSearchResult component
 */
interface UserSearchResultProps {
  /** User data to display */
  user: UserSearchResultWithStatus;
  /** Callback when send friend request is pressed */
  onSendFriendRequest: (user: UserSearchResultWithStatus) => void;
  /** Whether the send request action is loading */
  isLoading?: boolean;
  /** Current request status with this user */
  requestStatus: 'none' | 'sent' | 'received' | 'friends';
}

/**
 * Component for displaying individual user search results with friend request functionality
 * 
 * @param props - Component props
 * @returns JSX element for user search result item
 */
export default function UserSearchResult({ 
  user, 
  onSendFriendRequest,
  isLoading = false,
  requestStatus
}: UserSearchResultProps) {
  
  /**
   * Renders the user's avatar or placeholder
   */
  const renderAvatar = () => {
    if (user.avatarUrl) {
      return (
        <Image
          source={{ uri: user.avatarUrl }}
          className="w-12 h-12 rounded-full"
          resizeMode="cover"
        />
      );
    }
    
    return (
      <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center">
        <FontAwesome name="user" size={20} color="#6B7280" />
      </View>
    );
  };

  /**
   * Renders the user's display name (fullName or username fallback)
   */
  const renderDisplayName = () => {
    const displayName = user.fullName || user.username || 'Unknown User';
    return (
      <Text 
        className="text-base font-semibold text-gray-900"
        numberOfLines={1}
      >
        {displayName}
      </Text>
    );
  };

  /**
   * Renders the username if different from display name
   */
  const renderUsername = () => {
    // Only show username if it's different from the display name
    if (!user.username || user.username === user.fullName) {
      return null;
    }

    return (
      <Text 
        className="text-sm text-gray-500"
        numberOfLines={1}
      >
        @{user.username}
      </Text>
    );
  };

  /**
   * Renders the action button based on request status
   */
  const renderActionButton = () => {
    if (isLoading) {
      return (
        <View className="w-20 h-8 bg-gray-100 rounded-lg items-center justify-center">
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }

    switch (requestStatus) {
      case 'none':
        return (
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg active:bg-blue-700"
            onPress={() => onSendFriendRequest(user)}
          >
            <Text className="text-white font-medium text-sm">Add Friend</Text>
          </TouchableOpacity>
        );

      case 'sent':
        return (
          <View className="bg-yellow-100 px-4 py-2 rounded-lg">
            <Text className="text-yellow-800 font-medium text-sm">Pending</Text>
          </View>
        );

      case 'received':
        return (
          <View className="bg-green-100 px-4 py-2 rounded-lg">
            <Text className="text-green-800 font-medium text-sm">Accept Request</Text>
          </View>
        );

      case 'friends':
        return (
          <View className="bg-green-100 px-4 py-2 rounded-lg flex-row items-center">
            <FontAwesome name="check" size={12} color="#16A34A" />
            <Text className="text-green-800 font-medium text-sm ml-1">Friends</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="bg-white p-4 border-b border-gray-200 flex-row items-center">
      {/* Avatar */}
      {renderAvatar()}
      
      {/* User Info */}
      <View className="flex-1 ml-3">
        {renderDisplayName()}
        {renderUsername()}
      </View>
      
      {/* Action Button */}
      {renderActionButton()}
    </View>
  );
} 