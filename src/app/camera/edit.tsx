/**
 * Photo edit screen placeholder
 * Temporary screen to resolve navigation routing
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoEditScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Photo',
          headerShown: false,
        }}
      />
      
      <View className="flex-1 bg-black">
        {photoUri && (
          <Image 
            source={{ uri: photoUri }} 
            className="flex-1" 
            resizeMode="contain" 
          />
        )}
        
        <View className="absolute top-12 left-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/50 rounded-full p-3"
          >
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
        </View>
        
        <View className="absolute bottom-12 left-0 right-0 items-center">
          <Text className="text-white text-lg">Photo Edit (Placeholder)</Text>
        </View>
      </View>
    </>
  );
} 