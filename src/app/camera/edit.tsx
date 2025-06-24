/**
 * Photo edit screen for sharing captured photos
 * Allows users to share photos to conversations or stories
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversationsStore } from '../../stores/conversations';
import { useFriendsStore } from '../../stores/friends';

export default function PhotoEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  
  const [isUploading, setIsUploading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const { friends } = useFriendsStore();
  const { conversations } = useConversationsStore();

  /**
   * Handles sharing photo to a specific conversation
   */
  const handleShareToConversation = async (conversationId: string) => {
    if (!photoUri) return;
    
    try {
      setIsUploading(true);
      
      // TODO: Implement photo upload to Supabase storage and send photo message
      Alert.alert(
        'Photo Sharing',
        'Photo sharing will be implemented next! For now, this is a placeholder.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error sharing photo:', error);
      Alert.alert('Error', 'Failed to share photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles sharing photo to stories
   */
  const handleShareToStories = async () => {
    if (!photoUri) return;
    
    try {
      setIsUploading(true);
      
      // TODO: Implement stories upload
      Alert.alert(
        'Stories Feature',
        'Stories feature coming soon! For now, share with friends.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sharing to stories:', error);
      Alert.alert('Error', 'Failed to share to stories. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!photoUri) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">No photo to edit</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-400 text-base">Go Back</Text>
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
      
      <View className="flex-1 bg-black">
        {/* Photo Preview */}
        <View className="flex-1">
          <Image 
            source={{ uri: photoUri }} 
            className="flex-1" 
            resizeMode="contain" 
          />
          
          {/* Back button */}
          <View 
            className="absolute top-0 left-0 right-0 flex-row justify-between items-start px-6"
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-black/50 rounded-full p-3"
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Options */}
        <View 
          className="bg-black border-t border-gray-800 px-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="py-6">
            <Text className="text-white text-xl font-bold mb-4">Share Photo</Text>
            
            {/* Stories Button */}
            <TouchableOpacity
              onPress={handleShareToStories}
              disabled={isUploading}
              className="flex-row items-center bg-purple-600 rounded-lg p-4 mb-3"
            >
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text className="text-white font-semibold ml-3 text-base">Add to Stories</Text>
            </TouchableOpacity>

            {/* Friends List */}
            <Text className="text-gray-300 text-sm mb-3">Send to Friends</Text>
            <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.friendId}
                  onPress={() => {
                    // Find or create conversation with this friend
                    // For now, show placeholder
                    Alert.alert(
                      'Send to Friend',
                      `Send photo to ${friend.friend.fullName || friend.friend.username}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Send', onPress: () => {
                          // TODO: Implement friend messaging
                          Alert.alert('Feature Coming Soon', 'Direct friend messaging will be implemented next!');
                        }}
                      ]
                    );
                  }}
                  disabled={isUploading}
                  className="flex-row items-center bg-gray-800 rounded-lg p-3 mb-2"
                >
                  <View className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={16} color="#ffffff" />
                  </View>
                  <Text className="text-white font-medium">
                    {friend.friend.fullName || friend.friend.username || 'Unknown Friend'}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {friends.length === 0 && (
                <Text className="text-gray-400 text-center py-4">
                  No friends to share with. Add some friends first!
                </Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Loading Overlay */}
        {isUploading && (
          <View className="absolute inset-0 bg-black/70 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white text-lg mt-4">Uploading...</Text>
          </View>
        )}
      </View>
    </>
  );
} 