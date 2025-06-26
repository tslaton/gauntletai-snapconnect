import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Header } from '@/components/Header';

export default function ChatScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Chats" />
      <View className="flex-1 px-6 pt-6">
        
        <View className="flex-1 items-center justify-center">
          <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
            <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
              <FontAwesome name="comments" size={40} color="#9333EA" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</Text>
            <Text className="text-gray-500 text-center mb-6">
              Start chatting with your friends and share stories
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/friends')}
              className="bg-purple-600 px-6 py-3 rounded-full flex-row items-center"
            >
              <FontAwesome name="users" size={18} color="white" />
              <Text className="text-white font-medium ml-2">View Friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}