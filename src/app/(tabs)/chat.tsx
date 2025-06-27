import { Header } from '@/components/Header';
import ModalWrapper from '@/components/ModalWrapper';
import MoreOptionsMenu from '@/components/MoreOptionsMenu';
import NewConversation from '@/components/NewConversation';
import UserAvatar from '@/components/UserAvatar';
import { useConversationsStore, type Conversation } from '@/stores/conversations';
import { useUserStore } from '@/stores/user';
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
      className="flex-row items-center p-3 bg-white rounded-xl mb-3 shadow-sm"
    >
      <UserAvatar 
        uri={otherParticipant?.user?.avatarUrl} 
        size={56} 
        className="mr-4" 
      />
      <View className="flex-1">
        <Text className="font-bold text-base">{otherParticipant?.user?.fullName || otherParticipant?.user?.username || 'Unknown User'}</Text>
        <Text className="text-gray-500">
          {lastMessage
            ? `${lastMessagePrefix} ${lastMessageTime}`
            : 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View className="w-3 h-3 bg-purple-600 rounded-full ml-2 self-center" />
      )}
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const { conversations, isLoading, error, fetchConversations } = useConversationsStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations(currentUser.id);
    }
  }, [currentUser?.id, fetchConversations]);

  const handleMoreOptions = () => {
    setShowMoreOptions(true);
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
    <View className="flex-1 bg-gray-50">
      <Header title="Chats" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
      <View className="flex-1 px-4 pt-4">
        {/* Filter buttons */}
        <View className="flex-row mb-4 items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setFilter('All')}
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === 'All' ? 'bg-purple-100' : 'bg-white'
              }`}
            >
              <Text className={`${filter === 'All' ? 'font-bold text-purple-700' : 'font-semibold text-gray-700'}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('Unread')}
              className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${
                filter === 'Unread' ? 'bg-purple-100' : 'bg-white'
              }`}
            >
              <Text
                className={`${
                  filter === 'Unread' ? 'font-bold text-purple-700' : 'font-semibold text-gray-700'
                }`}
              >
                Unread
              </Text>
              {unreadCount > 0 && (
                <View className="bg-purple-600 rounded-full w-5 h-5 ml-2 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setShowNewConversationModal(true)}
            className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center"
          >
            <FontAwesome name="plus" size={14} color="white" />
            <Text className="text-white font-semibold ml-2">New</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-10" size="large" color="#9333EA" />
        ) : error ? (
          <View className="flex-1 items-center justify-center -mt-16">
            <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                <FontAwesome name="exclamation-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Unable to load conversations
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => currentUser?.id && fetchConversations(currentUser.id)}
                className="bg-purple-600 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ConversationItem item={item} currentUserId={currentUser?.id || ''} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center -mt-16">
            <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
              <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
                <FontAwesome name="comments" size={40} color="#9333EA" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'Unread' ? 'No unread messages' : 'No conversations yet'}
              </Text>
              <Text className="text-gray-500 text-center mb-6">
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