import { useUserStore } from '@/stores/user';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import UserAvatar from './UserAvatar';

export function AvatarButton() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const handlePress = () => router.push('/account');

  const hasAvatar = !!currentUser?.avatarUrl && currentUser.avatarUrl.trim() !== '';

  if (hasAvatar) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <UserAvatar uri={currentUser.avatarUrl} size={40} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#4F46E5' }}
      activeOpacity={0.7}
    >
      <Text className="text-white font-bold">
        {currentUser?.fullName?.[0]?.toUpperCase() ?? 'U'}
      </Text>
    </TouchableOpacity>
  );
}