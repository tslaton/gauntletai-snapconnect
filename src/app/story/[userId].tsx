import { checkRelationshipStatus, sendFriendRequest } from '@/api/friends';
import UserAvatar from '@/components/UserAvatar';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useFriendsStore } from '@/stores/friends';
import { useStoriesStore } from '@/stores/stories';
import { useUserStore } from '@/stores/user';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function StoryModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  
  const currentStory = useStoriesStore((state) => state.currentStory);
  const fetchStory = useStoriesStore((state) => state.fetchStory);
  const isLoading = useStoriesStore((state) => state.isLoading);
  
  const friends = useFriendsStore((state) => state.friends);
  const searchResults = useFriendsStore((state) => state.searchResults);
  const fetchSearchResults = useFriendsStore((state) => state.fetchSearchResults);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState<{
    isFriend: boolean;
    hasPendingRequest: boolean;
  }>({ isFriend: false, hasPendingRequest: false });
  const flatListRef = useRef<FlatList>(null);
  
  const displayName = currentStory?.profiles?.full_name || currentStory?.profiles?.username || 'User';

  useEffect(() => {
    if (userId) {
      fetchStory(userId);
      checkUserRelationship();
    }
  }, [userId, fetchStory]);

  const checkUserRelationship = async () => {
    if (!userId) return;
    
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) return;
      
      const status = await checkRelationshipStatus(currentUser.id, userId);
      setRelationshipStatus({
        isFriend: status.isFriend,
        hasPendingRequest: status.hasPendingRequest,
      });
    } catch (error) {
      console.error('Error checking relationship status:', error);
    }
  };

  const handleSwipeDown = ({ nativeEvent }: any) => {
    if (nativeEvent.translationY > 100 && nativeEvent.state === State.END) {
      router.back();
    }
  };

  const handleAddFriend = async () => {
    if (!userId) return;
    
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to send friend requests');
        return;
      }
      
      await sendFriendRequest(currentUser.id, userId);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send friend request';
      Alert.alert('Error', message);
    }
  };

  const handleLongPress = () => {
    if (currentStory?.profiles?.about) {
      setShowAbout(true);
      setTimeout(() => setShowAbout(false), 3000);
    }
  };

  const renderStoryContent = ({ item }: { item: any }) => {
    if (item.type === 'photo') {
      return (
        <Image
          source={{ uri: item.content_url }}
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="contain"
        />
      );
    }
    
    // TODO: Handle video content
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading story...</Text>
      </SafeAreaView>
    );
  }

  if (!currentStory || !currentStory.story_contents || currentStory.story_contents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">No story content available</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleSwipeDown}>
        <View className="flex-1 bg-black">
          {/* Story Content Carousel */}
          <FlatList
            ref={flatListRef}
            data={currentStory.story_contents}
            renderItem={renderStoryContent}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentIndex(newIndex);
            }}
          />
          
          {/* Progress Indicators */}
          <View className="absolute top-12 left-4 right-4 flex-row">
            {currentStory.story_contents.map((_, index) => (
              <View
                key={index}
                className="flex-1 h-1 mx-1 rounded-full"
                style={{
                  backgroundColor: index === currentIndex ? colors.primary : colors.muted,
                }}
              />
            ))}
          </View>
          
          {/* User Info Card */}
          <View className="absolute bottom-8 left-4 right-4">
            <TouchableOpacity
              onLongPress={handleLongPress}
              className="bg-card/90 rounded-lg p-4 flex-row items-center"
            >
              <UserAvatar uri={currentStory.profiles?.avatar_url} size={48} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-bold text-lg">
                  {displayName}
                </Text>
                {currentStory.profiles?.username && (
                  <Text className="text-muted-foreground text-sm">
                    @{currentStory.profiles.username}
                  </Text>
                )}
              </View>
              {!relationshipStatus.isFriend && !relationshipStatus.hasPendingRequest && userId && (
                <TouchableOpacity
                  onPress={handleAddFriend}
                  className="bg-primary rounded-full p-3"
                >
                  <FontAwesome name="user-plus" size={20} color={colors.primaryForeground} />
                </TouchableOpacity>
              )}
              {relationshipStatus.hasPendingRequest && (
                <View className="bg-muted rounded-full px-4 py-2">
                  <Text className="text-muted-foreground text-sm">Pending</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* About popup */}
            {showAbout && currentStory.profiles?.about && (
              <View className="bg-card/95 rounded-lg p-4 mt-2">
                <Text className="text-foreground">{currentStory.profiles.about}</Text>
              </View>
            )}
          </View>
          
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 right-4 bg-black/50 rounded-full p-2"
          >
            <FontAwesome name="times" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}