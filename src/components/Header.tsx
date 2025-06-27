import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { AvatarButton } from './AvatarButton';
import Friends from './Friends';

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
  const backgroundColor = transparent ? 'transparent' : 'white';
  const iconColor = transparent ? '#ffffff' : '#374151';

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
          {title && <Text className="text-lg font-semibold text-gray-900">{title}</Text>}
        </View>

        {/* Right side - Action buttons */}
        <View style={{ width: 80 }}>
          <RightComponent />
        </View>
      </View>
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={friendSearchModalVisible}
        onRequestClose={() => setFriendSearchModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="relative flex-row items-center justify-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Add Friends</Text>
            <TouchableOpacity 
              onPress={() => setFriendSearchModalVisible(false)}
              className="absolute right-4"
            >
              <FontAwesome name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <Friends />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}