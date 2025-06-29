import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Reset states when URL changes
  useEffect(() => {
    if (itinerary.cover_image_url) {
      setImageError(false);
      setImageLoading(true);
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (imageLoading) {
          console.warn('Image loading timeout:', itinerary.cover_image_url);
          setImageLoading(false);
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [itinerary.cover_image_url]);

  const dateRange = formatDateRange(itinerary.start_time, itinerary.end_time);

  return (
    <TouchableOpacity
      onPress={() => onPress(itinerary.id)}
      onLongPress={() => onLongPress?.(itinerary)}
      className="bg-card rounded-xl overflow-hidden mb-4 shadow-sm"
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      {itinerary.cover_image_url && !imageError ? (
        <>
          <Image
            source={{ uri: itinerary.cover_image_url }}
            className="w-full h-40"
            resizeMode="cover"
            onError={(error) => {
              console.error('ItineraryCard - Image load error:', error.nativeEvent.error);
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
          />
          {imageLoading && (
            <View className="absolute inset-0 w-full h-40 bg-muted items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </>
      ) : (
        <View className="w-full h-40 bg-muted items-center justify-center">
          <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
          {imageError && itinerary.cover_image_url && (
            <Text className="text-xs text-muted-foreground mt-1">Failed to load image</Text>
          )}
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