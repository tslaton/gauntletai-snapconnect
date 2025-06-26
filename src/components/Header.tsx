import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { AvatarButton } from './AvatarButton';

interface HeaderProps {
  title?: string;
  showAvatar?: boolean;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, showAvatar = true, rightComponent, transparent = false }: HeaderProps) {
  const backgroundColor = transparent ? 'transparent' : 'white';
  
  return (
    <SafeAreaView style={{ backgroundColor }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor,
      }}>
        {/* Left side - Avatar */}
        <View className="w-10 h-10">
          {showAvatar && <AvatarButton />}
        </View>

        {/* Center - Title */}
        <View className="flex-1 items-center">
          {title && (
            <Text className="text-lg font-semibold text-gray-900">
              {title}
            </Text>
          )}
        </View>

        {/* Right side - Placeholder or custom component */}
        <View className="w-10 h-10">
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
}