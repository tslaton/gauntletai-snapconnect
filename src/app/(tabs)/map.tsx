import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Header } from '@/components/Header';

export default function MapScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Map" />
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
          <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <FontAwesome name="map-marker" size={40} color="#4F46E5" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Map View</Text>
          <Text className="text-gray-500 text-center">
            Discover events and stories happening around you
          </Text>
          <View className="bg-indigo-50 px-4 py-2 rounded-full mt-4">
            <Text className="text-indigo-700 text-sm font-medium">Coming Soon</Text>
          </View>
        </View>
      </View>
    </View>
  );
}