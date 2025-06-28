/**
 * @file EventCard component for displaying individual events in a list
 * Provides a reusable component for showing event details with image, title, time, and tags
 */

import { type Event } from '@/stores/events';
import { formatEventTime, relativeTime } from '@/utils/relativeTime';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Props for the EventCard component
 */
interface EventCardProps {
  /** Event data to display */
  event: Event;
  /** Callback when the card is pressed */
  onPress?: (event: Event) => void;
  /** Whether the card should be disabled */
  disabled?: boolean;
  /** Additional styling for the card */
  className?: string;
}

/**
 * Component for displaying individual events in a card format
 * 
 * @param props - Component props
 * @returns JSX element for event card
 */
export default function EventCard({ 
  event,
  onPress,
  disabled = false,
  className = ''
}: EventCardProps) {
  const colors = useThemeColors();
  
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  /**
   * Renders the event image or placeholder
   */
  const renderImage = () => {
    const imageSize = 80; // 80px square image

    if (!event.imageUrl || imageError) {
      return (
        <View 
          className="bg-muted rounded-lg items-center justify-center"
          style={{ width: imageSize, height: imageSize }}
        >
          <FontAwesome name="calendar" size={24} color={colors.mutedForeground} />
        </View>
      );
    }

    return (
      <View 
        className="rounded-lg overflow-hidden bg-muted"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          source={{ uri: event.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View className="absolute inset-0 bg-muted" />
        )}
      </View>
    );
  };

  /**
   * Renders the event title
   */
  const renderTitle = () => {
    return (
      <Text 
        className={`text-base font-semibold ${disabled ? 'text-muted-foreground/50' : 'text-foreground'}`}
        numberOfLines={2}
      >
        {event.title}
      </Text>
    );
  };

  /**
   * Renders the event timing information
   */
  const renderTimeInfo = () => {
    const relativeTimeText = relativeTime(event.startTime);
    const fullTimeText = formatEventTime(event.startTime);

    return (
      <View className="mt-1">
        <Text className={`text-sm font-medium ${disabled ? 'text-muted-foreground/30' : 'text-primary'}`}>
          {relativeTimeText}
        </Text>
        <Text className={`text-xs ${disabled ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
          {fullTimeText}
        </Text>
      </View>
    );
  };

  /**
   * Renders the event location
   */
  const renderLocation = () => {
    if (!event.location) return null;

    return (
      <View className="flex-row items-center mt-1">
        <FontAwesome 
          name="map-marker" 
          size={12} 
          color={disabled ? colors.border : colors.mutedForeground} 
        />
        <Text 
          className={`text-xs ml-1 flex-1 ${disabled ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}
          numberOfLines={1}
        >
          {event.location}
        </Text>
      </View>
    );
  };

  /**
   * Renders event tags as chips
   */
  const renderTags = () => {
    if (!event.tags || event.tags.length === 0) return null;

    // Limit to first 3 tags to prevent overflow
    const displayTags = event.tags.slice(0, 3);
    const hasMoreTags = event.tags.length > 3;

    return (
      <View className="mt-2">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          <View className="flex-row">
            {displayTags.map((tag, index) => (
              <View
                key={`${tag}-${index}`}
                className={`px-2 py-1 rounded-full mr-2 ${
                  disabled ? 'bg-muted' : 'bg-primary/10'
                }`}
              >
                <Text 
                  className={`text-xs font-medium ${
                    disabled ? 'text-muted-foreground/50' : 'text-primary'
                  }`}
                >
                  {tag}
                </Text>
              </View>
            ))}
            {hasMoreTags && (
              <View
                className={`px-2 py-1 rounded-full ${
                  disabled ? 'bg-muted' : 'bg-secondary'
                }`}
              >
                <Text 
                  className={`text-xs font-medium ${
                    disabled ? 'text-muted-foreground/50' : 'text-secondary-foreground'
                  }`}
                >
                  +{event.tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  /**
   * Renders attendee count if available
   */
  const renderAttendeeInfo = () => {
    if (!event.maxAttendees) return null;

    return (
      <View className="flex-row items-center mt-1">
        <FontAwesome 
          name="users" 
          size={12} 
          color={disabled ? colors.border : colors.mutedForeground} 
        />
        <Text 
          className={`text-xs ml-1 ${disabled ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}
        >
          Max {event.maxAttendees} attendees
        </Text>
      </View>
    );
  };

  const cardContent = (
    <View
      className={`bg-card mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
    >
      {/* Event Image */}
      {renderImage()}
      
      {/* Event Info */}
      <View className="flex-1 ml-3">
        {renderTitle()}
        {renderTimeInfo()}
        {renderLocation()}
        {renderAttendeeInfo()}
        {renderTags()}
      </View>
    </View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress && !disabled) {
    return (
      <TouchableOpacity 
        onPress={() => onPress(event)}
        activeOpacity={0.7}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
} 