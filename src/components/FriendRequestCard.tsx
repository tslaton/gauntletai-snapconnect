/**
 * @file FriendRequestCard component for displaying individual friend requests
 * Provides a reusable component for showing friend request details with accept/decline actions
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
import { type UserSearchResult } from '../utils/friendsApi';

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
    if (requester.avatarUrl) {
      return (
        <Image
          source={{ uri: requester.avatarUrl }}
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
    const requestDate = new Date(friendRequest.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60));
    
    let timeAgo: string;
    if (diffInHours < 1) {
      timeAgo = 'Just now';
    } else if (diffInHours < 24) {
      timeAgo = `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      timeAgo = `${diffInDays}d ago`;
    }

    return (
      <Text className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
        {timeAgo}
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
      <View className="flex-row space-x-2">
        {/* Decline Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full border-2 border-gray-300 items-center justify-center ${
            disabled || isLoading ? 'opacity-50' : 'active:bg-gray-50'
          }`}
          onPress={() => onDecline(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isDeclineLoading ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <FontAwesome name="times" size={16} color="#6B7280" />
          )}
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full bg-blue-600 items-center justify-center ${
            disabled || isLoading ? 'opacity-50' : 'active:bg-blue-700'
          }`}
          onPress={() => onAccept(friendRequest.id)}
          disabled={disabled || isLoading}
        >
          {isAcceptLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <FontAwesome name="check" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      className={`bg-white p-4 border-b border-gray-200 flex-row items-center ${
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