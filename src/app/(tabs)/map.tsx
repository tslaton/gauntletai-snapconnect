import { Header } from '@/components/Header';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Text, View } from 'react-native';

export default function MapScreen() {
  const colors = useThemeColors();
  
  const handleMoreOptions = () => {
    // TODO: Implement popover menu for map options
    console.log('More options pressed for Map tab');
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Map" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-card rounded-2xl p-8 shadow-sm items-center">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <FontAwesome name="map-marker" size={40} color={colors.primary} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">Map View</Text>
          <Text className="text-muted-foreground text-center">
            Discover events and stories happening around you
          </Text>
          <View className="bg-accent px-4 py-2 rounded-full mt-4">
            <Text className="text-accent-foreground text-sm font-medium">Coming Soon</Text>
          </View>
        </View>
      </View>
    </View>
  );
}