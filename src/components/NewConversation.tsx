/**
 * @file NewConversation component for starting new chat conversations
 * Displays user's friends list and allows creating or navigating to conversations
 */

import { fetchFriends, type Friend } from '@/api/friends';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConversationsStore } from '@/stores/conversations';
import { useUserStore } from '@/stores/user';
import { timeAgo } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UserAvatar from './UserAvatar';

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
  const colors = useThemeColors();

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
        className="mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center"
        style={{ backgroundColor: colors.card }}
      >
        {/* Avatar */}
        <UserAvatar uri={item.friend.avatarUrl} size={48} />

        {/* Friend Info */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold" style={{ color: colors.foreground }} numberOfLines={1}>
            {displayName}
          </Text>
          {item.friend.username && item.friend.username !== item.friend.fullName && (
            <Text className="text-sm" style={{ color: colors.mutedForeground }} numberOfLines={1}>
              @{item.friend.username}
            </Text>
          )}
        </View>

        {/* Activity Badge or Loading */}
        {isCreatingConversation ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : item.lastActivity ? (
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.muted }}>
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>
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
          <View className="rounded-2xl p-8 shadow-sm items-center" style={{ backgroundColor: colors.card }}>
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.muted }}>
              <FontAwesome name="search" size={40} color={colors.mutedForeground} />
            </View>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No friends found
            </Text>
            <Text className="text-center" style={{ color: colors.mutedForeground }}>
              No friends match &quot;{searchQuery}&quot;
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="rounded-2xl p-8 shadow-sm items-center" style={{ backgroundColor: colors.card }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.accent }}>
            <FontAwesome name="users" size={40} color={colors.primary} />
          </View>
          <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
            No friends yet
          </Text>
          <Text className="text-center" style={{ color: colors.mutedForeground }}>
            Add friends to start conversations
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>

      {/* Search Input */}
      <View className="px-4 pt-4 pb-4">
        <View className="flex-row items-center rounded-xl px-4 py-3" style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }}>
          <FontAwesome name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            className="flex-1 ml-3 text-base"
            style={{ color: colors.foreground, backgroundColor: 'transparent', paddingVertical: 0 }}
            placeholder="Search friends..."
            placeholderTextColor={colors.mutedForeground}
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
              <FontAwesome name="times-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4" style={{ color: colors.mutedForeground }}>Loading friends...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="rounded-2xl p-8 shadow-sm items-center" style={{ backgroundColor: colors.card }}>
              <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.destructive + '20' }}>
                <FontAwesome name="exclamation-circle" size={40} color={colors.destructive} />
              </View>
              <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
                Unable to load friends
              </Text>
              <Text className="text-center mb-6" style={{ color: colors.mutedForeground }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={loadFriends}
                className="px-6 py-3 rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-medium" style={{ color: colors.primaryForeground }}>Try Again</Text>
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