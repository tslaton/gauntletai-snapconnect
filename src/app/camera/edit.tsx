/**
 * Photo edit screen for sharing captured photos
 * Allows users to share photos to conversations or stories
 */

import { sendMessage } from '@/api/messages';
import UserAvatar from '@/components/UserAvatar';
import { useConversationsStore } from '@/stores/conversations';
import { useFriendsStore } from '@/stores/friends';
import { useStoriesStore } from '@/stores/stories';
import { useUserStore } from '@/stores/user';
import { uploadPhoto, validatePhoto } from '@/utils/photoStorage';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

export default function PhotoEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const viewShotRef = useRef<ViewShot>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [showCaption, setShowCaption] = useState(false);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);

  const { friends, isFriendsLoading: friendsLoading, fetchFriends } = useFriendsStore();
  const { conversations, startDirectConversation } = useConversationsStore();
  const { currentUser } = useUserStore();
  const { addStoryContent } = useStoriesStore();

  // Load friends when component mounts
  useEffect(() => {
    if (currentUser?.id) {
      fetchFriends(currentUser.id);
    }
  }, [currentUser?.id, fetchFriends]);

  /**
   * Capture the edited photo with filters and caption
   */
  const captureEditedPhoto = async (): Promise<string | null> => {
    if (!viewShotRef.current) {
      console.error('ViewShot ref is not available');
      return null;
    }

    try {
      const uri = await viewShotRef.current.capture!();
      return uri;
    } catch (error) {
      console.error('Failed to capture edited photo:', error);
      return null;
    }
  };

  /**
   * Handles sharing photo to a specific conversation
   */
  const handleShareToConversation = async (conversationId: string) => {
    if (!photoUri || !currentUser?.id) return;

    try {
      setIsUploading(true);

      let finalPhotoUri = photoUri;
      if (showCaption && caption) {
        const capturedUri = await captureEditedPhoto();
        if (capturedUri) {
          finalPhotoUri = capturedUri;
        } else {
          Alert.alert('Error', 'Could not capture the edited photo. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Validate photo first
      const validation = await validatePhoto(finalPhotoUri);
      if (!validation.valid) {
        Alert.alert('Invalid Photo', validation.error || 'Photo is not valid');
        setIsUploading(false);
        return;
      }

      // Upload photo to Supabase Storage
      const uploadResult = await uploadPhoto(finalPhotoUri, currentUser.id, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        compress: true,
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload photo');
        setIsUploading(false);
        return;
      }

      // Send photo message
      await sendMessage(
        {
          conversationId,
          content: uploadResult.publicUrl,
          type: 'photo',
        },
        currentUser.id
      );

      Alert.alert('Photo Sent!', 'Your photo has been shared successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error sharing photo:', error);
      Alert.alert('Error', 'Failed to share photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles sharing photo to a friend (creates/finds conversation first)
   */
  const handleShareToFriend = async (friendId: string, friendName: string) => {
    if (!currentUser?.id) return;

    try {
      setIsUploading(true);

      // Create or get direct conversation with friend
      const conversationResult = await startDirectConversation(currentUser.id, friendId);

      if (!conversationResult.success || !conversationResult.conversation) {
        Alert.alert('Error', conversationResult.error || 'Failed to start conversation');
        return;
      }

      // Share photo to the conversation
      await handleShareToConversation(conversationResult.conversation.id);
    } catch (error) {
      console.error('Error sharing to friend:', error);
      Alert.alert('Error', 'Failed to share photo to friend. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles sharing photo to stories
   */
  const handleShareToStories = async () => {
    if (!photoUri || !currentUser?.id) return;

    try {
      setIsUploading(true);

      let finalPhotoUri = photoUri;
      if (showCaption && caption) {
        const capturedUri = await captureEditedPhoto();
        if (capturedUri) {
          finalPhotoUri = capturedUri;
        } else {
          Alert.alert('Error', 'Could not capture the edited photo. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Validate photo first
      const validation = await validatePhoto(finalPhotoUri);
      if (!validation.valid) {
        Alert.alert('Invalid Photo', validation.error || 'Photo is not valid');
        setIsUploading(false);
        return;
      }

      // Upload photo to Supabase Storage
      const uploadResult = await uploadPhoto(finalPhotoUri, currentUser.id, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        compress: true,
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload photo');
        setIsUploading(false);
        return;
      }

      // Add photo to story
      await addStoryContent({
        type: 'photo',
        content_url: uploadResult.publicUrl,
        story_id: '', // This will be set by the store
        user_id: currentUser.id,
      });

      Alert.alert('Story Updated!', 'Your photo has been added to your story.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error sharing to stories:', error);
      Alert.alert('Error', 'Failed to share to stories. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!photoUri) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-lg text-white">No photo to edit</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-base text-blue-400">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Share Photo',
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#000' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom}>
        <View className="flex-1 bg-black">
          {/* Photo Preview with Filters */}
          <View
            className="flex-1"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setImageLayout({ width, height });
            }}>
            {imageLayout && imageLayout.width > 0 && (
              <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  {/* Photo */}
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* Caption Overlay */}
                  {showCaption && caption && (
                    <View className="absolute bottom-4 left-4 right-4">
                      <View className="rounded-lg bg-black/70 px-4 py-3">
                        <Text className="text-center text-lg font-semibold text-white">{caption}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </ViewShot>
            )}
          </View>

          {/* Top Navigation Bar */}
          <View
            className="absolute top-0 left-0 right-0 flex-row items-start justify-between px-6"
            style={{ paddingTop: insets.top + 16 }}>
            {/* Back button */}
            <TouchableOpacity onPress={() => router.back()} className="rounded-full bg-black/50 p-3">
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity
              onPress={() => setShowShareModal(true)}
              className="rounded-full bg-black/50 p-3"
              disabled={isUploading}>
              <Ionicons name="share-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Editing Controls */}
        <View className="bg-black">
          {/* Caption Input – placed ABOVE filter bar for better visibility */}
          <View className="border-t border-gray-800 px-6 py-3" style={{ paddingBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setShowCaption(!showCaption)}
              className="flex-row items-center justify-between">
              <Text className="font-medium text-white">Add Caption</Text>
              <Ionicons
                name={showCaption ? 'checkmark-circle' : 'add-circle-outline'}
                size={24}
                color={showCaption ? '#9333ea' : '#9ca3af'}
              />
            </TouchableOpacity>

            {showCaption && (
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a caption..."
                placeholderTextColor="#6b7280"
                maxLength={200}
                multiline
                className="mt-3 rounded-lg bg-gray-800 px-4 py-3 text-white"
                style={{ minHeight: 60, maxHeight: 120 }}
              />
            )}
          </View>
        </View>

        {/* Share Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showShareModal}
          onRequestClose={() => setShowShareModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowShareModal(false)}
            className="flex-1 justify-end bg-black/50">
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-3xl bg-gray-900"
              style={{ paddingBottom: insets.bottom }}>
              {/* Modal Header */}
              <View className="flex-row items-center justify-between border-b border-gray-800 px-6 py-4">
                <Text className="text-xl font-bold text-white">Share Photo</Text>
                <TouchableOpacity onPress={() => setShowShareModal(false)}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View className="px-6 py-4">
                {/* Stories Button */}
                <TouchableOpacity
                  onPress={async () => {
                    setShowShareModal(false);
                    await handleShareToStories();
                  }}
                  disabled={isUploading}
                  className="mb-3 flex-row items-center rounded-lg bg-purple-600 p-4">
                  <Ionicons name="add-circle" size={24} color="#ffffff" />
                  <Text className="ml-3 text-base font-semibold text-white">Add to Stories</Text>
                </TouchableOpacity>

                {/* Friends List */}
                <Text className="mb-3 text-sm text-gray-300">Send to Friends</Text>
                <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
                  {friendsLoading ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="small" color="#9CA3AF" />
                      <Text className="mt-2 text-sm text-gray-400">Loading friends...</Text>
                    </View>
                  ) : friends.length > 0 ? (
                    friends.map((friend) => (
                      <TouchableOpacity
                        key={friend.friendId}
                        onPress={() => {
                          const friendName = friend.friend.fullName || friend.friend.username;
                          setShowShareModal(false);
                          Alert.alert('Send to Friend', `Send photo to ${friendName}?`, [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Send',
                              onPress: () => handleShareToFriend(friend.friendId, friendName || 'Friend'),
                            },
                          ]);
                        }}
                        disabled={isUploading}
                        className="mb-2 flex-row items-center rounded-lg bg-gray-800 p-3">
                        <UserAvatar
                          uri={friend.friend.avatarUrl}
                          size={40}
                          className="mr-3"
                          fallbackIcon="user"
                          fallbackIconSize={16}
                        />
                        <Text className="font-medium text-white">
                          {friend.friend.fullName || friend.friend.username || 'Unknown Friend'}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="py-4 text-center text-gray-400">
                      No friends to share with. Add some friends first!
                    </Text>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Loading Overlay */}
        {isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/70">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-4 text-lg text-white">
              {isUploading ? 'Uploading photo...' : 'Loading...'}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
} 