/**
 * @file Friend discovery screen with search interface
 * Provides a screen for users to search and discover new friends
 */

import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import FriendSearch from '../../components/FriendSearch';

/**
 * Friend discovery screen component
 * 
 * @returns JSX element for the friend search screen
 */
export default function FriendSearchScreen() {

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Screen header configuration */}
      <Stack.Screen 
        options={{
          title: 'Find Friends',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      
      {/* Main content */}
      <View className="flex-1">
        <FriendSearch />
      </View>
    </SafeAreaView>
  );
} 