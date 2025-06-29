import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatDateRange } from '@/utils/dateHelpers';
import type { Itinerary } from '@/api/itineraries';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onPress: (id: string) => void;
  onLongPress?: (itinerary: Itinerary) => void;
}

export function ItineraryCard({ itinerary, onPress, onLongPress }: ItineraryCardProps) {
  const colors = useThemeColors();

  const dateRange = formatDateRange(itinerary.start_time, itinerary.end_time);

  return (
    <TouchableOpacity
      onPress={() => onPress(itinerary.id)}
      onLongPress={() => onLongPress?.(itinerary)}
      className="bg-card rounded-xl overflow-hidden mb-4 shadow-sm"
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      {itinerary.cover_image_url ? (
        <Image
          source={{ uri: itinerary.cover_image_url }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-muted items-center justify-center">
          <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        <Text className="text-xl font-semibold text-foreground mb-1">
          {itinerary.title}
        </Text>

        {itinerary.description && (
          <Text className="text-muted-foreground mb-3" numberOfLines={2}>
            {itinerary.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          {dateRange && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
              <Text className="text-sm text-muted-foreground ml-1">
                {dateRange}
              </Text>
            </View>
          )}

          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );
}