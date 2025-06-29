import { FriendCard } from '@/components/FriendCard';
import { Header } from '@/components/Header';
import { StoryCard } from '@/components/StoryCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useFriendsStore } from '@/stores/friends';
import { useStoriesStore } from '@/stores/stories';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalWrapper from '@/components/ModalWrapper';
import MoreOptionsMenu from '@/components/MoreOptionsMenu';

export default function StoriesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  
  // Friends store - ensure array type
  const friendsData = useFriendsStore((state) => state.friends);
  const friends = Array.isArray(friendsData) ? friendsData : [];
  const fetchFriends = useFriendsStore((state) => state.fetchFriends);
  const isFriendsLoading = useFriendsStore((state) => state.isFriendsLoading);
  
  // Stories store - ensure array type
  const storiesData = useStoriesStore((state) => state.recommendedStories);
  const recommendedStories = Array.isArray(storiesData) ? storiesData : [];
  const fetchRecommendedStories = useStoriesStore((state) => state.fetchRecommendedStories);
  const isStoriesLoading = useStoriesStore((state) => state.isLoading);
  
  const currentUser = useUserStore((state) => state.currentUser);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchFriends(currentUser.id);
      fetchRecommendedStories();
    }
  }, [currentUser, fetchFriends, fetchRecommendedStories]);

  const handleRefresh = async () => {
    if (!currentUser) return;
    
    setIsRefreshing(true);
    await Promise.all([
      fetchFriends(currentUser.id),
      fetchRecommendedStories(),
    ]);
    setIsRefreshing(false);
  };

  const handleMoreOptions = () => {
    setShowMoreOptions(true);
  };

  const handleFriendPress = (userId: string) => {
    if (!userId) return;
    router.push({
      pathname: '/story/[userId]',
      params: { userId },
    });
  };

  const handleStoryPress = (userId: string) => {
    if (!userId) return;
    router.push({
      pathname: '/story/[userId]',
      params: { userId },
    });
  };

  if (isFriendsLoading && friends.length === 0 && isStoriesLoading && recommendedStories.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <Header 
        title="Stories" 
        showAddFriend 
        showMoreOptions 
        onMoreOptionsPress={handleMoreOptions}
        showMyStory
        onMyStoryPress={() => {
          if (currentUser) {
            router.push({
              pathname: '/story/[userId]',
              params: { userId: currentUser.id },
            });
          }
        }}
      />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted-foreground mt-4">Loading stories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header 
        title="Stories" 
        showAddFriend 
        showMoreOptions 
        onMoreOptionsPress={handleMoreOptions}
        showMyStory
        onMyStoryPress={() => {
          if (currentUser) {
            router.push({
              pathname: '/story/[userId]',
              params: { userId: currentUser.id },
            });
          }
        }}
      />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Friends Section */}
        <View className="py-4">
          <Text className="text-lg font-bold text-foreground px-4 mb-3">Friends</Text>
          {friends.length > 0 ? (
            <FlatList
              horizontal
              data={friends}
              keyExtractor={(item) => item.friendId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => {
                try {
                  if (!item || !item.friend) {
                    return null;
                  }
                  const friendData = {
                    id: item.friend.id || '',
                    username: item.friend.username || null,
                    full_name: item.friend.fullName || null,
                    avatar_url: item.friend.avatarUrl || null,
                  };
                  return (
                    <TouchableOpacity
                      onPress={() => handleFriendPress(item.friendId)}
                      className="mr-4"
                    >
                      <FriendCard friend={friendData} />
                    </TouchableOpacity>
                  );
                } catch (error) {
                  console.error('Error rendering friend item:', error);
                  return null;
                }
              }}
            />
          ) : (
            <Text className="text-muted-foreground px-4 py-2">
              No friends yet. Add friends to see their stories!
            </Text>
          )}
        </View>

        {/* Discover Section */}
        <View className="py-4">
          <Text className="text-lg font-bold text-foreground px-4 mb-3">Discover</Text>
          {recommendedStories.length > 0 ? (
            <View className="px-4">
              <View className="flex-row flex-wrap -mx-2">
                {recommendedStories.map((story) => {
                  if (!story || !story.id) return null;
                  return (
                    <View key={story.id} className="w-1/2 px-2 mb-4">
                      <TouchableOpacity onPress={() => handleStoryPress(story.user_id)}>
                        <StoryCard story={story} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Text className="text-muted-foreground px-4 py-2">
              No stories to discover yet.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* More Options Menu */}
      <MoreOptionsMenu
        visible={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        context="stories"
      />
    </View>
  );
}