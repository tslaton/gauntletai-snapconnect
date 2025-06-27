import { useConversationsStore } from '@/stores/conversations';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type MenuContext = 'conversation-list' | 'conversation';

interface MenuOption {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => Promise<void>;
  isDevOnly?: boolean;
}

interface MoreOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  context: MenuContext;
  conversationId?: string;
}

export default function MoreOptionsMenu({ 
  visible, 
  onClose, 
  context,
  conversationId 
}: MoreOptionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null);
  const { currentUser } = useUserStore();
  const { fetchConversations } = useConversationsStore();

  // Check if dev mode is enabled
  const isDevMode = __DEV__ && currentUser?.email === 'dev@snapconnect.com';

  const handleOptionPress = async (option: MenuOption) => {
    setIsLoading(true);
    setLoadingOptionId(option.id);
    try {
      await option.onPress();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setLoadingOptionId(null);
    }
  };

  const handleDevReceiveMessage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const response = await fetch('/server/dev/receive-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Failed to send test message');
    
    Alert.alert(
      'Test Message Sent',
      `${data.from} sent you a message: "Hey!"`,
      [{ text: 'OK', onPress: onClose }]
    );
    
    // Refresh conversations to see the new message
    if (currentUser?.id) {
      fetchConversations(currentUser.id);
    }
  };

  const handleDevReceiveFriendRequest = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const response = await fetch('/server/dev/receive-friend-request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Failed to send test friend request');
    
    Alert.alert(
      'Test Friend Request Sent',
      `${data.from} sent you a friend request!`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleDevReceiveMessageInConversation = async () => {
    if (!conversationId) throw new Error('No conversation ID provided');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const response = await fetch('/server/dev/receive-message-in-conversation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Failed to send test message');
    
    Alert.alert(
      'Test Message Sent',
      `${data.from} sent: "${data.message}"`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const allOptions: Record<MenuContext, MenuOption[]> = useMemo(() => ({
    'conversation-list': [
      {
        id: 'receive-message',
        icon: 'comment',
        title: 'Receive Test Message',
        subtitle: 'A random friend will send "Hey!"',
        onPress: handleDevReceiveMessage,
        isDevOnly: true,
      },
      {
        id: 'receive-friend-request',
        icon: 'user-plus',
        title: 'Receive Friend Request',
        subtitle: 'A random user will send a request',
        onPress: handleDevReceiveFriendRequest,
        isDevOnly: true,
      },
    ],
    'conversation': [
      {
        id: 'receive-message-in-conversation',
        icon: 'comment',
        title: 'Receive Test Message',
        subtitle: 'Send a test message to this chat',
        onPress: handleDevReceiveMessageInConversation,
        isDevOnly: true,
      },
      {
        id: 'conversation-info',
        icon: 'info-circle',
        title: 'Conversation Info',
        subtitle: 'View conversation details',
        onPress: async () => {
          Alert.alert('Info', 'Conversation settings coming soon!');
          onClose();
        },
        isDevOnly: false,
      },
    ],
  }), [conversationId]);

  // Filter options based on context and dev mode
  const visibleOptions = useMemo(() => {
    const contextOptions = allOptions[context] || [];
    return contextOptions.filter(option => {
      if (option.isDevOnly && !isDevMode) return false;
      return true;
    });
  }, [context, isDevMode]);

  // Don't show menu if no options available
  if (visibleOptions.length === 0) {
    return null;
  }

  const title = context === 'conversation' ? 'Options' : 'Dev Tools';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-end" 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          className="bg-white rounded-t-3xl p-6" 
          activeOpacity={1}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
          <Text className="text-xl font-bold mb-6">{title}</Text>
          
          {visibleOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className="bg-purple-600 rounded-xl p-4 mb-3 opacity-100 disabled:opacity-50"
              onPress={() => handleOptionPress(option)}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                <FontAwesome name={option.icon as any} size={20} color="white" />
                <Text className="text-white font-semibold ml-3">{option.title}</Text>
              </View>
              <Text className="text-white/80 text-sm mt-1 ml-8">
                {option.subtitle}
              </Text>
              {loadingOptionId === option.id && (
                <View className="absolute inset-0 items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            className="mt-3 py-3"
            onPress={onClose}
          >
            <Text className="text-center text-gray-600">Cancel</Text>
          </TouchableOpacity>
          
          {isLoading && (
            <View className="absolute inset-0 bg-white/80 rounded-t-3xl items-center justify-center">
              <ActivityIndicator size="large" color="#9333EA" />
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}