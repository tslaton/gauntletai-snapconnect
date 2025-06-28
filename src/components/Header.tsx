import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AvatarButton } from './AvatarButton';
import Friends from './Friends';
import ModalWrapper from './ModalWrapper';

interface HeaderProps {
  title?: string;
  showAvatar?: boolean;
  transparent?: boolean;
  showAddFriend?: boolean;
  showMoreOptions?: boolean;
  onMoreOptionsPress?: () => void;
}

export function Header({
  title,
  showAvatar = true,
  transparent = false,
  showAddFriend = false,
  showMoreOptions = false,
  onMoreOptionsPress,
}: HeaderProps) {
  const [friendSearchModalVisible, setFriendSearchModalVisible] = useState(false);
  const themeColors = useThemeColors();
  const backgroundColor = transparent ? 'transparent' : themeColors.card;
  const iconColor = transparent ? '#ffffff' : themeColors.foreground;

  const RightComponent = () => (
    <View className="flex-row items-center justify-end">
      {showAddFriend && (
        <TouchableOpacity onPress={() => setFriendSearchModalVisible(true)} className="p-2">
          <FontAwesome name="user-plus" size={20} color={iconColor} />
        </TouchableOpacity>
      )}
      {showMoreOptions && (
        <TouchableOpacity onPress={onMoreOptionsPress} className="p-2 ml-2">
          <FontAwesome name="ellipsis-h" size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor,
        }}
      >
        {/* Left side - Avatar */}
        <View style={{ width: 80 }}>{showAvatar && <AvatarButton />}</View>

        {/* Center - Title */}
        <View className="flex-1 items-center">
          {title && <Text className="text-lg font-semibold" style={{ color: transparent ? '#ffffff' : themeColors.foreground }}>{title}</Text>}
        </View>

        {/* Right side - Action buttons */}
        <View style={{ width: 80 }}>
          <RightComponent />
        </View>
      </View>
      <ModalWrapper
        visible={friendSearchModalVisible}
        onClose={() => setFriendSearchModalVisible(false)}
        title="Add Friends"
      >
        <Friends />
      </ModalWrapper>
    </SafeAreaView>
  );
}