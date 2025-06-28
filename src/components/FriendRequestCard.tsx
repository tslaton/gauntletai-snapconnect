/**
 * @file FriendRequestCard component for displaying individual friend requests
 * Provides a reusable component for showing friend request details with accept/decline actions
 */

import { type UserSearchResult } from '@/api/friends';
import { useThemeColors } from '@/hooks/useThemeColors';
import { timeAgo } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UserAvatar from './UserAvatar';

/**
 * Interface for friend request data with user information
 */
export interface FriendRequestWithUser {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  requester: UserSearchResult; // User who sent the request
}

/**
 * Props for the FriendRequestCard component
 */
interface FriendRequestCardProps {
  /** Friend request data with user information */
  friendRequest: FriendRequestWithUser;
  /** Callback when accept button is pressed */
  onAccept: (requestId: string) => void;
  /** Callback when decline button is pressed */
  onDecline: (requestId: string) => void;
  /** Whether accept action is loading */
  isAcceptLoading?: boolean;
  /** Whether decline action is loading */
  isDeclineLoading?: boolean;
  /** Whether the card should be disabled */
  disabled?: boolean;
  /** Type of request card - 'received' or 'sent' */
  type: 'received' | 'sent';
}

/**
 * Component for displaying individual friend requests
 * 
 * @param props - Component props
 * @returns JSX element for friend request card
 */
export default function FriendRequestCard({ 
  friendRequest,
  onAccept,
  onDecline,
  isAcceptLoading = false,
  isDeclineLoading = false,
  disabled = false,
  type
}: FriendRequestCardProps) {
  
  const { requester } = friendRequest;
  const themeColors = useThemeColors();
  
  /**
   * Renders the user's avatar or placeholder
   */
  const renderAvatar = () => {
    return <UserAvatar uri={requester.avatarUrl} size={48} />;
  };

  /**
   * Renders the user's display name
   */
  const renderDisplayName = () => {
    const displayName = requester.fullName || requester.username || 'Unknown User';
    return (
      <Text 
        className="text-base font-semibold"
        style={{ color: disabled ? themeColors.mutedForeground : themeColors.foreground }}
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
    if (!requester.username || requester.username === requester.fullName) {
      return null;
    }

    return (
      <Text 
        className="text-sm"
        style={{ color: disabled ? themeColors.muted : themeColors.mutedForeground }}
        numberOfLines={1}
      >
        @{requester.username}
      </Text>
    );
  };

  /**
   * Renders the request timestamp
   */
  const renderTimestamp = () => {
    const timeAgoText = timeAgo(friendRequest.createdAt);
    const displayText = timeAgoText === 'now' ? 'Just now' : `${timeAgoText} ago`;

    return (
      <Text className="text-xs" style={{ color: disabled ? themeColors.muted : themeColors.mutedForeground }}>
        {displayText}
      </Text>
    );
  };

  /**
   * Renders action buttons based on request type and status
   */
  const renderActions = () => {
    const { status } = friendRequest;
    
    // For accepted requests, show success status
    if (status === 'accepted') {
      return (
        <View className="items-center">
          <View className="px-3 py-1 rounded-full flex-row items-center" style={{ backgroundColor: themeColors.affirmative + '20' }}>
            <FontAwesome name="check" size={12} color={themeColors.affirmative} />
            <Text className="text-xs font-medium ml-1" style={{ color: themeColors.affirmative }}>
              {type === 'sent' ? 'Accepted' : 'Friends'}
            </Text>
          </View>
        </View>
      );
    }

    // For declined requests, show declined status
    if (status === 'declined') {
      return (
        <View className="items-center">
          <View className="px-3 py-1 rounded-full flex-row items-center" style={{ backgroundColor: themeColors.destructive + '20' }}>
            <FontAwesome name="times" size={12} color={themeColors.destructive} />
            <Text className="text-xs font-medium ml-1" style={{ color: themeColors.destructive }}>
              {type === 'sent' ? 'Declined' : 'Rejected'}
            </Text>
          </View>
        </View>
      );
    }

    if (type === 'sent') {
      // For sent pending requests, show sent status
      return (
        <View className="items-center">
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: themeColors.muted }}>
            <Text className="text-xs font-medium" style={{ color: themeColors.mutedForeground }}>Sent</Text>
          </View>
        </View>
      );
    }

    // For received pending requests, show accept/decline buttons
    const isLoading = isAcceptLoading || isDeclineLoading;
    
    return (
      <View className="flex-row items-center">
        {/* Decline Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full border-2 items-center justify-center mr-3 ${
            disabled || isLoading ? 'opacity-50' : ''
          }`}
          style={{ borderColor: themeColors.destructive + '60' }}
          onPress={() => onDecline(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isDeclineLoading ? (
            <ActivityIndicator size="small" color={themeColors.destructive} />
          ) : (
            <FontAwesome name="ban" size={16} color={themeColors.destructive} />
          )}
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full border-2 items-center justify-center ${
            disabled || isLoading ? 'opacity-50' : ''
          }`}
          style={{ borderColor: themeColors.affirmative }}
          onPress={() => onAccept(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isAcceptLoading ? (
            <ActivityIndicator size="small" color={themeColors.affirmative} />
          ) : (
            <FontAwesome name="check" size={16} color={themeColors.affirmative} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      className={`mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center ${
        disabled ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: themeColors.card }}
    >
      {/* Avatar */}
      {renderAvatar()}
      
      {/* User Info */}
      <View className="flex-1 ml-3">
        {renderDisplayName()}
        {renderUsername()}
        {renderTimestamp()}
      </View>
      
      {/* Actions */}
      {renderActions()}
    </View>
  );
} 