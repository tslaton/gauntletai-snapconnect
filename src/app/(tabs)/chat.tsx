import { Header } from '@/components/Header';
import ModalWrapper from '@/components/ModalWrapper';
import MoreOptionsMenu from '@/components/MoreOptionsMenu';
import NewConversation from '@/components/NewConversation';
import UserAvatar from '@/components/UserAvatar';
import { useConversationsStore, type Conversation } from '@/stores/conversations';
import { useUserStore } from '@/stores/user';
import { useThemeColors } from '@/hooks/useThemeColors';
import { timeAgo } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ConversationItem = ({
  item,
  currentUserId,
}: {
  item: Conversation;
  currentUserId: string;
}) => {
  const otherParticipant = item.participants?.find((p) => p.userId !== currentUserId);
  const lastMessage = item.lastMessage;

  const lastMessageTime = lastMessage ? timeAgo(lastMessage.createdAt) : '';
  const lastMessagePrefix = lastMessage?.senderId === currentUserId ? 'Sent' : 'Received';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${item.id}`)}
      className="flex-row items-center p-3 bg-card rounded-xl mb-3 shadow-sm"
    >
      <UserAvatar 
        uri={otherParticipant?.user?.avatarUrl} 
        size={56} 
        className="mr-4" 
      />
      <View className="flex-1">
        <Text className="font-bold text-base text-foreground">{otherParticipant?.user?.fullName || otherParticipant?.user?.username || 'Unknown User'}</Text>
        <Text className="text-muted-foreground">
          {lastMessage
            ? `${lastMessagePrefix} ${lastMessageTime}`
            : 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View className="w-3 h-3 bg-primary rounded-full ml-2 self-center" />
      )}
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { conversations, isLoading, error, fetchConversations } = useConversationsStore();
  const { currentUser } = useUserStore();
  const colors = useThemeColors();

  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations(currentUser.id);
    }
  }, [currentUser?.id, fetchConversations]);

  const handleMoreOptions = () => {
    setShowMoreOptions(true);
  };

  const handleRefresh = async () => {
    if (!currentUser?.id) return;
    
    setRefreshing(true);
    try {
      await fetchConversations(currentUser.id);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredConversations = useMemo(() => {
    if (filter === 'Unread') {
      return conversations.filter((c) => c.unreadCount > 0);
    }
    return conversations;
  }, [conversations, filter]);

  const unreadCount = useMemo(() => {
    return conversations.filter((c) => c.unreadCount > 0).length;
  }, [conversations]);

  return (
    <View className="flex-1 bg-background">
      <Header title="Chats" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
      <View className="flex-1 px-4 pt-4">
        {/* Filter buttons */}
        <View className="flex-row mb-4 items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setFilter('All')}
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === 'All' ? 'bg-accent' : 'bg-card'
              }`}
            >
              <Text className={`${filter === 'All' ? 'font-bold text-accent-foreground' : 'font-semibold text-muted-foreground'}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('Unread')}
              className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${
                filter === 'Unread' ? 'bg-accent' : 'bg-card'
              }`}
            >
              <Text
                className={`${
                  filter === 'Unread' ? 'font-bold text-accent-foreground' : 'font-semibold text-muted-foreground'
                }`}
              >
                Unread
              </Text>
              {unreadCount > 0 && (
                <View className="bg-primary rounded-full w-5 h-5 ml-2 items-center justify-center">
                  <Text className="text-primary-foreground text-xs font-bold">{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setShowNewConversationModal(true)}
            className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          >
            <FontAwesome name="plus" size={14} color={colors.primaryForeground} />
            <Text className="text-primary-foreground font-semibold ml-2">New</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-10" size="large" color={colors.primary} />
        ) : error ? (
          <View className="flex-1 items-center justify-center -mt-16">
            <View className="bg-card rounded-2xl p-8 shadow-sm items-center">
              <View className="w-20 h-20 bg-destructive/20 rounded-full items-center justify-center mb-4">
                <FontAwesome name="exclamation-circle" size={40} color={colors.destructive} />
              </View>
              <Text className="text-xl font-semibold text-foreground mb-2">
                Unable to load conversations
              </Text>
              <Text className="text-muted-foreground text-center mb-6">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => currentUser?.id && fetchConversations(currentUser.id)}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-primary-foreground font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ConversationItem item={item} currentUserId={currentUser?.id || ''} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : (
          <View className="flex-1 items-center justify-center -mt-16">
            <View className="bg-card rounded-2xl p-8 shadow-sm items-center">
              <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-4">
                <FontAwesome name="comments" size={40} color={colors.primary} />
              </View>
              <Text className="text-xl font-semibold text-foreground mb-2">
                {filter === 'Unread' ? 'No unread messages' : 'No conversations yet'}
              </Text>
              <Text className="text-muted-foreground text-center mb-6">
                {filter === 'Unread' ? "You're all caught up!" : 'Start chatting with your friends.'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* New Conversation Modal */}
      <ModalWrapper
        visible={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        title="New Conversation"
      >
        <NewConversation onClose={() => setShowNewConversationModal(false)} />
      </ModalWrapper>

      {/* More Options Menu */}
      <MoreOptionsMenu
        visible={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        context="conversation-list"
      />
    </View>
  );
}