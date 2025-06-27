/**
 * @file FriendRequestCard component for displaying individual friend requests
 * Provides a reusable component for showing friend request details with accept/decline actions
 */

import { type UserSearchResult } from '@/api/friends';
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
        className={`text-base font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
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
        className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}
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
      <Text className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
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
          <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
            <FontAwesome name="check" size={12} color="#16A34A" />
            <Text className="text-green-800 text-xs font-medium ml-1">
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
          <View className="bg-red-100 px-3 py-1 rounded-full flex-row items-center">
            <FontAwesome name="times" size={12} color="#DC2626" />
            <Text className="text-red-800 text-xs font-medium ml-1">
              {type === 'sent' ? 'Declined' : 'Rejected'}
            </Text>
          </View>
        </View>
      );
    }

    if (type === 'sent') {
      // For sent pending requests, show pending status
      return (
        <View className="items-center">
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-800 text-xs font-medium">Pending</Text>
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
          className={`w-10 h-10 rounded-full border-2 border-red-300 items-center justify-center mr-3 ${
            disabled || isLoading ? 'opacity-50' : 'active:bg-red-50'
          }`}
          onPress={() => onDecline(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isDeclineLoading ? (
            <ActivityIndicator size="small" color="#FCA5A5" />
          ) : (
            <FontAwesome name="ban" size={16} color="#FCA5A5" />
          )}
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full border-2 border-green-500 items-center justify-center ${
            disabled || isLoading ? 'opacity-50' : 'active:bg-green-50'
          }`}
          onPress={() => onAccept(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isAcceptLoading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <FontAwesome name="check" size={16} color="#10B981" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      className={`bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center ${
        disabled ? 'opacity-60' : ''
      }`}
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