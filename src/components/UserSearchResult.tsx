/**
 * @file UserSearchResult component for displaying individual user search results
 * Provides a reusable component for showing user information with friend request action
 */

import { type UserSearchResultWithStatus } from '@/api/friends';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UserAvatar from './UserAvatar';

/**
 * Props for the UserSearchResult component
 */
interface UserSearchResultProps {
  /** User data to display */
  user: UserSearchResultWithStatus;
  /** Callback when send friend request is pressed */
  onSendFriendRequest: (user: UserSearchResultWithStatus) => void;
   /** Callback to remove a friend */
  onRemoveFriend: (user: UserSearchResultWithStatus) => void;
  /** Whether the send request action is loading */
  isLoading?: boolean;
    /** Whether the remove friend action is loading */
  isRemoving?: boolean;
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
  onRemoveFriend,
  isLoading = false,
  isRemoving = false,
  requestStatus
}: UserSearchResultProps) {
  const themeColors = useThemeColors();
  
  /**
   * Renders the user's avatar or placeholder
   */
  const renderAvatar = () => {
    return <UserAvatar uri={user.avatarUrl} size={48} />;
  };

  /**
   * Renders the user's display name (fullName or username fallback)
   */
  const renderDisplayName = () => {
    const displayName = user.fullName || user.username || 'Unknown User';
    return (
      <Text 
        className="text-base font-semibold"
        style={{ color: themeColors.foreground }}
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
        className="text-sm"
        style={{ color: themeColors.mutedForeground }}
        numberOfLines={1}
      >
        @{user.username}
      </Text>
    );
  };

  /**
   * Renders the friend since date
   */
  const renderFriendSince = () => {
    if (requestStatus !== 'friends' || !user.friendshipCreatedAt) {
      return null;
    }

    const friendDate = new Date(user.friendshipCreatedAt);
    const friendSince = friendDate.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short' 
    });

    return (
      <Text className="text-xs mt-1" style={{ color: themeColors.mutedForeground }}>
        Friends since {friendSince}
      </Text>
    );
  };

  const handleRemoveFriend = () => {
    const displayName = user.fullName || user.username || 'this user';
    
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${displayName} from your friends list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveFriend(user),
        },
      ]
    );
  };

  /**
   * Renders the action button based on request status
   */
  const renderActionButton = () => {
    if (isLoading || isRemoving) {
      return (
        <View className="w-20 h-8 items-center justify-center">
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      );
    }

    switch (requestStatus) {
      case 'none':
        return (
          <TouchableOpacity
            className="w-10 h-10 rounded-full border items-center justify-center"
            style={{ borderColor: themeColors.affirmative + '60' }}
            onPress={() => onSendFriendRequest(user)}
          >
            <FontAwesome name="plus" size={16} color={themeColors.affirmative} />
          </TouchableOpacity>
        );

      case 'sent':
        return (
          <View className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#FEF3C720' }}>
            <Text className="font-medium text-sm" style={{ color: '#F59E0B' }}>Pending</Text>
          </View>
        );

      case 'received':
        return (
          <View className="px-4 py-2 rounded-lg" style={{ backgroundColor: themeColors.affirmative + '20' }}>
            <Text className="font-medium text-sm" style={{ color: themeColors.affirmative }}>Accept Request</Text>
          </View>
        );

      case 'friends':
        return (
          <TouchableOpacity
            className="w-10 h-10 rounded-full border-2 items-center justify-center"
            style={{ borderColor: themeColors.destructive + '60' }}
            onPress={handleRemoveFriend}
          >
            <FontAwesome name="times" size={16} color={themeColors.destructive} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View className="mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center" style={{ backgroundColor: themeColors.card }}>
      {/* Avatar */}
      {renderAvatar()}
      
      {/* User Info */}
      <View className="flex-1 ml-3">
        {renderDisplayName()}
        {renderUsername()}
        {renderFriendSince()}
      </View>
      
      {/* Action Button */}
      {renderActionButton()}
    </View>
  );
} 