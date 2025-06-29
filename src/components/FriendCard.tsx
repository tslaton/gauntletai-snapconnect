import React from 'react';
import { Text, View } from 'react-native';
import UserAvatar from './UserAvatar';

interface Friend {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  if (!friend) {
    return null;
  }
  
  const displayName = friend.full_name || friend.username || 'User';
  
  return (
    <View className="items-center">
      <UserAvatar uri={friend.avatar_url} size={64} />
      <Text 
        className="text-xs font-bold text-foreground mt-2 text-center"
        numberOfLines={1}
        style={{ width: 64 }}
      >
        {displayName}
      </Text>
    </View>
  );
}