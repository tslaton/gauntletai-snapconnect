import Avatar from '@/components/Avatar';
import { useProfileStore } from '@/stores/profile';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import React, { useEffect } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Account({ session }: { session: Session }) {
  // Select state and actions individually for performance, as recommended.
  const isLoading = useProfileStore((state) => state.isLoading);
  const username = useProfileStore((state) => state.username);
  const website = useProfileStore((state) => state.website);
  const error = useProfileStore((state) => state.error);

  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const setUsername = useProfileStore((state) => state.setUsername);
  const setWebsite = useProfileStore((state) => state.setWebsite);
  const clearError = useProfileStore((state) => state.clearError);

  const avatarUrl = useProfileStore((state) => state.avatarUrl);
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl);

  useEffect(() => {
    if (session) {
      fetchProfile(session);
    }
  }, [session, fetchProfile]);

  // Effect to show alerts when an error occurs in the store.
  useEffect(() => {
    if (error) {
      Alert.alert(error);
      clearError(); // Clear the error from the store after showing it
    }
  }, [error, clearError]);

  return (
    <View className="mt-10 p-4">
      <View className="py-2">
        <Avatar 
          url={avatarUrl}
          size={200}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            saveProfile(session);
          }}
        />
        <Text className="text-gray-700 mb-1 ml-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 bg-gray-100 text-gray-500"
          value={session?.user?.email}
          editable={false}
        />
      </View>

      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 bg-white"
          value={username || ''}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Website</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 bg-white"
          value={website || ''}
          onChangeText={setWebsite}
          autoCapitalize="none"
        />
      </View>

      <View className="py-2 mt-4">
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => saveProfile(session)}
          className="bg-blue-600 rounded-md py-3 items-center justify-center active:bg-blue-700 disabled:bg-gray-400"
        >
          <Text className="text-white text-base font-bold">
            {isLoading ? 'Loading ...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="py-2">
        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          className="bg-gray-700 rounded-md py-3 items-center justify-center active:bg-gray-800"
        >
          <Text className="text-white text-base font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}