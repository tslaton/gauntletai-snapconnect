import { useThemeColors } from '@/hooks/useThemeColors';
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

export type MenuContext = 'conversation-list' | 'conversation' | 'itineraries';

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
  onNewItinerary?: () => void;
}

export default function MoreOptionsMenu({ 
  visible, 
  onClose, 
  context,
  conversationId,
  onNewItinerary 
}: MoreOptionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null);
  const { currentUser } = useUserStore();
  const { fetchConversations } = useConversationsStore();
  const colors = useThemeColors();

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
    'itineraries': [
      {
        id: 'new-itinerary',
        icon: 'plus-circle',
        title: 'New Itinerary',
        subtitle: 'Create a new travel plan',
        onPress: async () => {
          if (onNewItinerary) {
            onNewItinerary();
          }
          onClose();
        },
        isDevOnly: false,
      },
    ],
  }), [conversationId, onNewItinerary]);

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

  const title = context === 'conversation' ? 'Options' : context === 'itineraries' ? 'Options' : 'Dev Tools';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 justify-end" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          className="rounded-t-3xl p-6" 
          style={{ backgroundColor: colors.card }}
          activeOpacity={1}
        >
          <View className="w-12 h-1 rounded-full self-center mb-6" style={{ backgroundColor: colors.muted }} />
          <Text className="text-xl font-bold mb-6" style={{ color: colors.foreground }}>{title}</Text>
          
          {visibleOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className="rounded-xl p-4 mb-3 opacity-100 disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
              onPress={() => handleOptionPress(option)}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                <FontAwesome name={option.icon as any} size={20} color={colors.primaryForeground} />
                <Text className="font-semibold ml-3" style={{ color: colors.primaryForeground }}>{option.title}</Text>
              </View>
              <Text className="text-sm mt-1 ml-8" style={{ color: colors.primaryForeground, opacity: 0.8 }}>
                {option.subtitle}
              </Text>
              {loadingOptionId === option.id && (
                <View className="absolute inset-0 items-center justify-center">
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            className="mt-3 py-3"
            onPress={onClose}
          >
            <Text className="text-center" style={{ color: colors.mutedForeground }}>Cancel</Text>
          </TouchableOpacity>
          
          {isLoading && (
            <View className="absolute inset-0 rounded-t-3xl items-center justify-center" style={{ backgroundColor: `${colors.card}CC` }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}