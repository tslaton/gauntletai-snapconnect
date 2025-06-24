/**
 * @file Account component for user profile management
 * Compact design that avoids keyboard overlap issues
 */

import { useProfileStore } from '@/stores/profile';
import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Account({ session }: { session: Session }) {
  // Profile store state
  const isLoading = useProfileStore((state) => state.isLoading);
  const username = useProfileStore((state) => state.username);
  const website = useProfileStore((state) => state.website);
  const error = useProfileStore((state) => state.error);
  const avatarUrl = useProfileStore((state) => state.avatarUrl);

  // Profile store actions
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const setUsername = useProfileStore((state) => state.setUsername);
  const setWebsite = useProfileStore((state) => state.setWebsite);
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl);
  const clearError = useProfileStore((state) => state.clearError);

  // Local state for avatar upload
  const [isUploading, setIsUploading] = useState(false);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchProfile(session);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    if (avatarUrl) {
      downloadImage(avatarUrl);
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  /**
   * Downloads avatar image from Supabase storage
   */
  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;

      const fileReader = new FileReader();
      fileReader.readAsDataURL(data);
      fileReader.onload = () => {
        setDisplayAvatarUrl(fileReader.result as string);
      };
    } catch (error) {
      console.log('Error downloading image:', error);
    }
  }

  /**
   * Handles avatar upload when avatar is tapped
   */
  async function uploadAvatar() {
    try {
      setIsUploading(true);

      const imagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (imagePickerResult.canceled || !imagePickerResult.assets || imagePickerResult.assets.length === 0) {
        return;
      }

      const selectedImage = imagePickerResult.assets[0];
      if (!selectedImage.uri) throw new Error('No image uri!');

      const imageArrayBuffer = await fetch(selectedImage.uri).then((res) => res.arrayBuffer());
      const fileExtension = selectedImage.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const storagePath = `${Date.now()}.${fileExtension}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, imageArrayBuffer, {
          contentType: selectedImage.mimeType ?? 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      setAvatarUrl(data.path);
      saveProfile(session);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Upload Error', error.message);
      }
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Handles user sign out with proper cleanup
   */
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state change will be handled by the main App component
      // which will automatically redirect to the Auth screen
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  /**
   * Renders the clickable avatar with upload functionality
   */
  const renderAvatar = () => (
    <TouchableOpacity 
      onPress={uploadAvatar}
      disabled={isUploading}
      className="items-center mb-4"
    >
      <View className="relative">
        {displayAvatarUrl ? (
          <Image
            source={{ uri: displayAvatarUrl }}
            className="w-20 h-20 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 bg-gray-300 rounded-full items-center justify-center">
            <FontAwesome name="user" size={32} color="#6B7280" />
          </View>
        )}
        
        {/* Upload indicator overlay */}
        <View className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="camera" size={12} color="white" />
          )}
        </View>
      </View>
      
      <Text className="text-xs text-gray-500 mt-1 text-center">
        {isUploading ? 'Uploading...' : 'Tap to change photo'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-4 pt-4">
      {/* Compact Avatar Section */}
      <View className="items-center mb-6">
        {renderAvatar()}
      </View>

      {/* Compact Form Fields */}
      <View className="space-y-4">
        {/* Email Field */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 text-sm"
            value={session?.user?.email}
            editable={false}
          />
        </View>

        {/* Username Field */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            value={username || ''}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Enter username"
          />
        </View>

        {/* Website Field */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Website</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            value={website || ''}
            onChangeText={setWebsite}
            autoCapitalize="none"
            placeholder="Enter website URL"
          />
        </View>
      </View>

      {/* Compact Action Buttons */}
      <View className="mt-6 space-y-3">
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => saveProfile(session)}
          className="bg-blue-600 rounded-lg py-3 items-center justify-center active:bg-blue-700 disabled:bg-gray-400"
        >
          <Text className="text-white text-sm font-semibold">
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-gray-600 rounded-lg py-3 items-center justify-center active:bg-gray-700"
        >
          <Text className="text-white text-sm font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}