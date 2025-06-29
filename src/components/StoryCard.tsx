import { useThemeColors } from '@/hooks/useThemeColors';
import { Story } from '@/stores/stories';
import React from 'react';
import { Image, Text, View } from 'react-native';
import UserAvatar from './UserAvatar';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const colors = useThemeColors();
  
  if (!story) {
    return null;
  }
  
  const displayName = story.profiles?.full_name || story.profiles?.username || 'User';
  const firstContent = story.story_contents?.[0];
  
  return (
    <View 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.card }}
    >
      {/* Story Preview Image */}
      {firstContent && firstContent.type === 'photo' && (
        <Image
          source={{ uri: firstContent.content_url }}
          className="w-full aspect-[3/4]"
          resizeMode="cover"
        />
      )}
      
      {/* User Info Overlay */}
      <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/50">
        <View className="flex-row items-center">
          <UserAvatar uri={story.profiles?.avatar_url} size={32} />
          <Text className="text-white font-semibold ml-2 flex-1" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>
      
      {/* Content Count Badge */}
      {story.story_contents && story.story_contents.length > 1 && (
        <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
          <Text className="text-white text-xs font-medium">
            {story.story_contents.length}
          </Text>
        </View>
      )}
    </View>
  );
}