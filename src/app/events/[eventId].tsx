/**
 * @file Dynamic route for individual event details
 * Displays comprehensive information about a specific event
 */

import UserAvatar from '@/components/UserAvatar';
import { useEventsStore } from '@/stores/events';
import { formatEventTime, relativeTime } from '@/utils/relativeTime';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Dynamic route component for individual event details
 * Accessed via /events/[eventId]
 * 
 * @returns JSX element for the event detail screen
 */
export default function EventDetailRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { 
    selectedEvent, 
    isLoadingEvent, 
    eventError, 
    fetchEvent, 
    clearSelectedEvent,
    clearEventError 
  } = useEventsStore();

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Validate event ID parameter
  useEffect(() => {
    if (!eventId || typeof eventId !== 'string') {
      Alert.alert('Error', 'Invalid event ID', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    // Fetch event details
    fetchEvent(eventId);

    // Cleanup when component unmounts
    return () => {
      clearSelectedEvent();
      clearEventError();
    };
  }, [eventId, fetchEvent, clearSelectedEvent, clearEventError]);

  /**
   * Renders the event image or placeholder
   */
  const renderEventImage = () => {
    if (!selectedEvent?.imageUrl || imageError) {
      return (
        <View className="h-64 bg-gray-300 items-center justify-center">
          <FontAwesome name="calendar" size={48} color="#6B7280" />
        </View>
      );
    }

    return (
      <View className="h-64 bg-gray-200">
        <Image
          source={{ uri: selectedEvent.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View className="absolute inset-0 bg-gray-200 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        )}
      </View>
    );
  };

  /**
   * Renders the event timing section
   */
  const renderEventTiming = () => {
    if (!selectedEvent) return null;

    const relativeTimeText = relativeTime(selectedEvent.startTime);
    const fullTimeText = formatEventTime(selectedEvent.startTime);
    const endTimeText = selectedEvent.endTime ? formatEventTime(selectedEvent.endTime) : null;

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="clock-o" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-indigo-600 ml-2">
            {relativeTimeText}
          </Text>
        </View>
        <Text className="text-gray-700 mb-1">
          <Text className="font-medium">Starts:</Text> {fullTimeText}
        </Text>
        {endTimeText && (
          <Text className="text-gray-700">
            <Text className="font-medium">Ends:</Text> {endTimeText}
          </Text>
        )}
      </View>
    );
  };

  /**
   * Renders the event location section
   */
  const renderLocation = () => {
    if (!selectedEvent?.location) return null;

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="map-marker" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Location</Text>
        </View>
        <Text className="text-gray-700 leading-5">
          {selectedEvent.location}
        </Text>
      </View>
    );
  };

  /**
   * Renders the event description section
   */
  const renderDescription = () => {
    if (!selectedEvent?.description) return null;

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="align-left" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-gray-900 ml-2">About this event</Text>
        </View>
        <Text className="text-gray-700 leading-6">
          {selectedEvent.description}
        </Text>
      </View>
    );
  };

  /**
   * Renders the event tags section
   */
  const renderTags = () => {
    if (!selectedEvent?.tags || selectedEvent.tags.length === 0) return null;

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <FontAwesome name="tags" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Tags</Text>
        </View>
        <View className="flex-row flex-wrap">
          {selectedEvent.tags.map((tag, index) => (
            <View
              key={`${tag}-${index}`}
              className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2"
            >
              <Text className="text-blue-700 text-sm font-medium">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /**
   * Renders the event creator section
   */
  const renderCreator = () => {
    if (!selectedEvent?.creator) return null;

    const creator = selectedEvent.creator;
    const displayName = creator.fullName || creator.username || 'Unknown Creator';

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <FontAwesome name="user" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Organized by</Text>
        </View>
        <View className="flex-row items-center">
          <UserAvatar 
            uri={creator.avatarUrl} 
            size={48} 
            className="mr-3" 
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {displayName}
            </Text>
            {creator.username && creator.username !== creator.fullName && (
              <Text className="text-sm text-gray-500">
                @{creator.username}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Renders the event capacity section
   */
  const renderCapacity = () => {
    if (!selectedEvent?.maxAttendees) return null;

    return (
      <View className="bg-white p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="users" size={16} color="#4F46E5" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Capacity</Text>
        </View>
        <Text className="text-gray-700">
          Maximum {selectedEvent.maxAttendees} attendees
        </Text>
      </View>
    );
  };

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="text-gray-500 mt-4">Loading event details...</Text>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View className="flex-1 items-center justify-center px-8 bg-gray-50">
      <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
          <FontAwesome name="exclamation-circle" size={40} color="#DC2626" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          Event not found
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {eventError || 'This event could not be loaded.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-indigo-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      {/* Custom Header */}
      <View className="relative flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <FontAwesome name="chevron-left" size={16} color="#374151" />
          <Text className="text-base text-gray-700 ml-2">Back</Text>
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold">Event Details</Text>
        
        <TouchableOpacity>
          <FontAwesome name="share" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      {isLoadingEvent ? (
        renderLoading()
      ) : eventError || !selectedEvent ? (
        renderError()
      ) : (
        <ScrollView 
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
        >
          {/* Event Image */}
          {renderEventImage()}
          
          {/* Event Title */}
          <View className="bg-white p-4 border-b border-gray-100">
            <Text className="text-2xl font-bold text-gray-900 leading-8">
              {selectedEvent.title}
            </Text>
          </View>
          
          {/* Event Details Sections */}
          {renderEventTiming()}
          {renderLocation()}
          {renderDescription()}
          {renderTags()}
          {renderCreator()}
          {renderCapacity()}
          
          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 