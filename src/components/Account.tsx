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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UserAvatar from './UserAvatar';

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
    if (!avatarUrl) {
      setDisplayAvatarUrl(null);
      return;
    }

    // If avatarUrl is already a full URL, use it directly
    if (/^https?:\/\//.test(avatarUrl)) {
      setDisplayAvatarUrl(avatarUrl);
    } else {
      // Otherwise download from storage and convert to data URL (legacy support)
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

      // After successful upload, obtain a public URL for the stored file
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath);

      // Fallback to storage path if public URL cannot be resolved
      const finalUrl = publicUrlData.publicUrl ?? data.path;

      setAvatarUrl(finalUrl);
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
      className="items-center"
    >
      <View className="relative">
        <UserAvatar uri={displayAvatarUrl} size={96} />
        
        {/* Upload indicator overlay */}
        <View className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full items-center justify-center border-2 border-white shadow-sm">
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="camera" size={14} color="white" />
          )}
        </View>
      </View>
      
      <Text className="text-sm text-gray-500 mt-3 text-center">
        {isUploading ? 'Uploading...' : 'Tap to change photo'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-6 py-8">
      {/* Centered container with max width */}
      <View className="flex-1 justify-center max-w-sm mx-auto w-full">
        {/* Avatar Section */}
        <View className="items-center mb-8">
          {renderAvatar()}
        </View>

        {/* Form Fields with better spacing */}
        <View className="space-y-5">
          {/* Email Field */}
          <View>
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-600 text-base"
              value={session?.user?.email}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Username Field */}
          <View>
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Username</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 text-base"
              value={username || ''}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter username"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Website Field */}
          <View>
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Website</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 text-base"
              value={website || ''}
              onChangeText={setWebsite}
              autoCapitalize="none"
              placeholder="Enter website URL"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Action Buttons with better styling */}
        <View className="mt-8 space-y-3">
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => saveProfile(session)}
            className="bg-indigo-600 rounded-xl py-4 items-center justify-center active:bg-indigo-700 disabled:bg-gray-400 shadow-sm"
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-white border border-gray-200 rounded-xl py-4 items-center justify-center active:bg-gray-50"
          >
            <Text className="text-gray-700 text-base font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}