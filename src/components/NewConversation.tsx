/**
 * @file NewConversation component for starting new chat conversations
 * Displays user's friends list and allows creating or navigating to conversations
 */

import { fetchFriends, type Friend } from '@/api/friends';
import { useConversationsStore } from '@/stores/conversations';
import { useUserStore } from '@/stores/user';
import { timeAgo } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface NewConversationProps {
  onClose: () => void;
}

interface FriendWithConversation extends Friend {
  conversationId?: string;
  lastActivity?: string;
  lastActivityType?: 'sent' | 'received';
}

export default function NewConversation({ onClose }: NewConversationProps) {
  const { currentUser } = useUserStore();
  const { conversations, startDirectConversation } = useConversationsStore();
  const [friends, setFriends] = useState<FriendWithConversation[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FriendWithConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  // Load friends and match with conversations
  useEffect(() => {
    loadFriends();
  }, [currentUser?.id]);

  const loadFriends = async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoading(true);
      const friendsList = await fetchFriends(currentUser.id);
      
      // Match friends with existing conversations
      const friendsWithConversations = friendsList.map(friend => {
        // Find conversation with this friend
        const conversation = conversations.find(conv => 
          conv.participants.some(p => p.userId === friend.friend.id)
        );

        let result: FriendWithConversation = { ...friend };

        if (conversation) {
          result.conversationId = conversation.id;
          if (conversation.lastMessage) {
            result.lastActivity = conversation.lastMessage.createdAt;
            result.lastActivityType = conversation.lastMessage.senderId === currentUser.id ? 'sent' : 'received';
          }
        }

        return result;
      });

      // Sort alphabetically by display name
      friendsWithConversations.sort((a, b) => {
        const nameA = a.friend.fullName || a.friend.username || '';
        const nameB = b.friend.fullName || b.friend.username || '';
        return nameA.localeCompare(nameB);
      });

      setFriends(friendsWithConversations);
      setFilteredFriends(friendsWithConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter friends based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = friends.filter(friend => {
      const fullName = friend.friend.fullName?.toLowerCase() || '';
      const username = friend.friend.username?.toLowerCase() || '';
      return fullName.includes(query) || username.includes(query);
    });

    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  const handleFriendPress = async (friend: FriendWithConversation) => {
    if (!currentUser?.id) return;

    // If conversation exists, navigate to it
    if (friend.conversationId) {
      onClose();
      router.push(`/chat/${friend.conversationId}`);
      return;
    }

    // Create new conversation
    try {
      setIsCreating(friend.friend.id);
      const result = await startDirectConversation(currentUser.id, friend.friend.id);
      if (result.success && result.conversation) {
        onClose();
        router.push(`/chat/${result.conversation.id}`);
      } else {
        console.error('Failed to create conversation:', result.error);
        alert(`Failed to create conversation: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCreating(null);
    }
  };

  const renderFriend = ({ item }: { item: FriendWithConversation }) => {
    const displayName = item.friend.fullName || item.friend.username || 'Unknown User';
    const isCreatingConversation = isCreating === item.friend.id;

    return (
      <TouchableOpacity
        onPress={() => handleFriendPress(item)}
        disabled={isCreatingConversation}
        className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center"
      >
        {/* Avatar */}
        <Image
          source={{ uri: item.friend.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp' }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />

        {/* Friend Info */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {displayName}
          </Text>
          {item.friend.username && item.friend.username !== item.friend.fullName && (
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              @{item.friend.username}
            </Text>
          )}
        </View>

        {/* Activity Badge or Loading */}
        {isCreatingConversation ? (
          <ActivityIndicator size="small" color="#9333EA" />
        ) : item.lastActivity ? (
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-600">
              {item.lastActivityType === 'sent' ? 'Sent' : 'Received'} {timeAgo(item.lastActivity)}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <FontAwesome name="search" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No friends found
            </Text>
            <Text className="text-gray-500 text-center">
              No friends match "{searchQuery}"
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
          <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
            <FontAwesome name="users" size={40} color="#9333EA" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            No friends yet
          </Text>
          <Text className="text-gray-500 text-center">
            Add friends to start conversations
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">

      {/* Search Input */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <FontAwesome name="search" size={16} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search friends..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="ml-2 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="text-gray-500 mt-4">Loading friends...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                <FontAwesome name="exclamation-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Unable to load friends
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                {error}
              </Text>
              <TouchableOpacity
                onPress={loadFriends}
                className="bg-purple-600 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : filteredFriends.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.friend.id}
            renderItem={renderFriend}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}