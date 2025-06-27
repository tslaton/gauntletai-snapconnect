/**
 * @file FriendsList component for displaying and managing the user's friends list
 * Provides search functionality, alphabetical sorting, and friend removal with confirmation
 */

import { useFriendsStore, type Friend } from '@/stores/friends';
import { useUserStore } from '@/stores/user';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UserAvatar from './UserAvatar';

/**
 * Props for the FriendsList component
 */
interface FriendsListProps {
  /** Callback when a friend is selected for chat or viewing profile */
  onFriendPress?: (friend: Friend) => void;
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

/**
 * Individual friend item component
 */
interface FriendItemProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
  isRemoving: boolean;
}

/**
 * Component for displaying individual friend items
 */
function FriendItem({ friend, onPress, onRemove, isRemoving }: FriendItemProps) {
  /**
   * Renders the friend's avatar or placeholder
   */
  const renderAvatar = () => {
    return <UserAvatar uri={friend.friend.avatarUrl} size={48} />;
  };

  /**
   * Renders the friend's display name
   */
  const renderDisplayName = () => {
    const displayName = friend.friend.fullName || friend.friend.username || 'Unknown User';
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
    if (!friend.friend.username || friend.friend.username === friend.friend.fullName) {
      return null;
    }

    return (
      <Text 
        className="text-sm text-gray-500"
        numberOfLines={1}
      >
        @{friend.friend.username}
      </Text>
    );
  };

  /**
   * Renders the friend since date
   */
  const renderFriendSince = () => {
    const friendDate = new Date(friend.createdAt);
    const friendSince = friendDate.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short' 
    });

    return (
      <Text className="text-xs text-gray-400">
        Friends since {friendSince}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      className="bg-white p-4 border-b border-gray-200 flex-row items-center"
      onPress={() => onPress?.(friend)}
      disabled={isRemoving}
    >
      {/* Avatar */}
      {renderAvatar()}
      
      {/* Friend Info */}
      <View className="flex-1 ml-3">
        {renderDisplayName()}
        {renderUsername()}
        {renderFriendSince()}
      </View>
      
      {/* Remove Button */}
      <TouchableOpacity
        className={`w-10 h-10 rounded-full border border-red-300 items-center justify-center ${
          isRemoving ? 'opacity-50' : 'active:bg-red-50'
        }`}
        onPress={() => onRemove(friend)}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <FontAwesome name="trash" size={16} color="#DC2626" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/**
 * Component for displaying and managing the user's friends list
 * Includes search functionality, alphabetical sorting, and friend removal
 * 
 * @param props - Component props
 * @returns JSX element for friends list
 */
export default function FriendsList({ 
  onFriendPress, 
  showSearch = true,
  emptyMessage = "You don't have any friends yet."
}: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get stores
  const { currentUser } = useUserStore();
  const {
    friends,
    isFriendsLoading,
    friendsError,
    fetchFriends,
    searchFriends,
    removeFriend,
    isFriendRemovalInProgress,
    clearFriendsError,
  } = useFriendsStore();

  // Load friends on component mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchFriends(currentUser.id);
    }
  }, [currentUser?.id]);

  // Handle search with debouncing
  useEffect(() => {
    if (!currentUser?.id) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFriends(currentUser.id, searchQuery);
      } else {
        fetchFriends(currentUser.id);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser?.id]);

  // Sort friends alphabetically by display name
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const nameA = a.friend.fullName || a.friend.username || '';
      const nameB = b.friend.fullName || b.friend.username || '';
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });
  }, [friends]);

  /**
   * Handles friend removal with confirmation
   */
  const handleRemoveFriend = (friend: Friend) => {
    const displayName = friend.friend.fullName || friend.friend.username || 'this user';
    
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
                     onPress: async () => {
             if (!currentUser?.id) return;
             
             const result = await removeFriend(currentUser.id, friend.friendId);
             if (!result.success && result.error) {
               Alert.alert('Error', result.error);
             }
           },
        },
      ]
    );
  };

  /**
   * Renders the search input
   */
  const renderSearchInput = () => {
    if (!showSearch) return null;

    return (
      <View className="p-4 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-300">
          <FontAwesome name="search" size={16} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search friends..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /**
   * Renders the loading state
   */
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading friends...</Text>
    </View>
  );

  /**
   * Renders the error state
   */
  const renderError = () => (
    <View className="flex-1 items-center justify-center p-8">
      <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
      <Text className="text-red-600 font-semibold text-lg mt-4">Error</Text>
      <Text className="text-gray-600 text-center mt-2 mb-4">
        {friendsError}
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg active:bg-blue-700"
                 onPress={() => {
           clearFriendsError();
           if (currentUser?.id) {
             fetchFriends(currentUser.id);
           }
         }}
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders the empty state
   */
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center p-8">
      <FontAwesome name="users" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 font-semibold text-lg mt-4">No Friends</Text>
      <Text className="text-gray-400 text-center mt-2">
        {searchQuery.trim() 
          ? `No friends found matching "${searchQuery}"`
          : emptyMessage
        }
      </Text>
    </View>
  );

  /**
   * Renders a friend item with removal functionality
   */
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <FriendItem
      friend={item}
      onPress={onFriendPress}
      onRemove={handleRemoveFriend}
      isRemoving={isFriendRemovalInProgress(item.friendId)}
    />
  );

  // Show loading state
  if (isFriendsLoading && friends.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        {renderSearchInput()}
        {renderLoading()}
      </View>
    );
  }

  // Show error state
  if (friendsError && friends.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        {renderSearchInput()}
        {renderError()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderSearchInput()}
      
      {sortedFriends.length === 0 ? (
        renderEmpty()
      ) : (
                <FlatList
          data={sortedFriends}
          keyExtractor={(item) => `${item.userId}-${item.friendId}`}
          renderItem={renderFriendItem}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={async () => {
            if (!currentUser?.id) return;
            
            setIsRefreshing(true);
            try {
              if (searchQuery.trim()) {
                await searchFriends(currentUser.id, searchQuery);
              } else {
                await fetchFriends(currentUser.id);
              }
            } finally {
              setIsRefreshing(false);
            }
          }}
        />
      )}
      
      {/* Friends count at bottom */}
      {sortedFriends.length > 0 && (
        <View className="p-4 bg-white border-t border-gray-200">
          <Text className="text-center text-gray-500 text-sm">
            {sortedFriends.length} friend{sortedFriends.length !== 1 ? 's' : ''}
            {searchQuery.trim() && ` matching "${searchQuery}"`}
          </Text>
        </View>
      )}
    </View>
  );
} 