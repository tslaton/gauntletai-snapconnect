import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatTimeRange } from '@/utils/dateHelpers';
import type { Activity } from '@/api/activities';

interface ActivityCardProps {
  activity: Activity;
  onPress: (activity: Activity) => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const colors = useThemeColors();
  const [imageError, setImageError] = useState(false);

  const timeRange = formatTimeRange(activity.start_time, activity.end_time, activity.timezone);

  return (
    <TouchableOpacity
      onPress={() => onPress(activity)}
      className="bg-card rounded-lg overflow-hidden mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Activity Image */}
        {activity.image_url && !imageError ? (
          <Image
            source={{ uri: activity.image_url }}
            className="w-20"
            style={{ alignSelf: 'stretch' }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-20 bg-muted items-center justify-center" style={{ alignSelf: 'stretch' }}>
            <Ionicons name="image-outline" size={24} color={colors.mutedForeground} />
          </View>
        )}

        {/* Content */}
        <View className="flex-1 p-3">
          {/* Title and Location */}
          <View className="mb-1">
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-semibold text-foreground flex-1 mr-2" numberOfLines={1}>
                {activity.title}
              </Text>
              {/* Weather Info */}
              {(activity.weather || activity.temperature) && (
                <View className="flex-row items-center">
                  {activity.temperature && (
                    <Text className="text-sm text-muted-foreground mr-1">
                      {activity.temperature}°F
                    </Text>
                  )}
                  {activity.weather && (
                    <MaterialCommunityIcons
                      name={activity.weather as any}
                      size={20}
                      color={colors.mutedForeground}
                    />
                  )}
                </View>
              )}
            </View>
            {activity.location && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                <Text className="text-sm text-muted-foreground ml-1" numberOfLines={1}>
                  {activity.location}
                </Text>
              </View>
            )}
          </View>

          {/* Time Range */}
          {timeRange && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
              <Text className="text-sm text-muted-foreground ml-1">
                {timeRange}
              </Text>
            </View>
          )}

          {/* Description Preview */}
          {activity.description && (
            <Text className="text-sm text-muted-foreground mb-2" numberOfLines={2}>
              {activity.description}
            </Text>
          )}

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <View className="flex-row flex-wrap -mb-1">
              {activity.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-accent px-2 py-1 rounded-full mr-2 mb-1"
                >
                  <Text className="text-xs text-accent-foreground">{tag}</Text>
                </View>
              ))}
              {activity.tags.length > 3 && (
                <View className="bg-accent px-2 py-1 rounded-full mb-1">
                  <Text className="text-xs text-accent-foreground">+{activity.tags.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}