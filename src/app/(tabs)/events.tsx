/**
 * @file Events tab screen for displaying and searching events
 * Provides the main events list view with search functionality
 */

import EventCard from '@/components/EventCard';
import { Header } from '@/components/Header';
import { useDebounce } from '@/hooks/useDebounce';
import { useEventsStore, type Event } from '@/stores/events';
import { useUserStore } from '@/stores/user';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Main events tab screen component
 * 
 * @returns JSX element for events screen
 */
export default function EventsScreen() {
  const colors = useThemeColors();
  const { 
    events, 
    isLoading, 
    error, 
    searchQuery,
    fetchEvents, 
    refreshEvents,
    searchEvents,
    setSearchQuery,
    clearSearch,
    getEventsCount,
    getUpcomingEvents 
  } = useEventsStore();
  
  const { currentUser } = useUserStore();
  
  // Local search input state
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // Debounce the search input with 400ms delay
  const debouncedSearchQuery = useDebounce(searchInput, 400);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery);
      
      if (debouncedSearchQuery.trim()) {
        searchEvents(debouncedSearchQuery);
      } else {
        fetchEvents(); // Fetch all events when search is cleared
      }
    }
  }, [debouncedSearchQuery, searchQuery, setSearchQuery, searchEvents, fetchEvents]);

  /**
   * Handles event card press to navigate to event details
   */
  const handleEventPress = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  /**
   * Handles refresh when user pulls down
   */
  const handleRefresh = async () => {
    await refreshEvents();
  };

  /**
   * Handles clearing the search
   */
  const handleClearSearch = async () => {
    setSearchInput('');
    await clearSearch();
  };

  /**
   * Renders the search input
   */
  const renderSearchInput = () => (
    <View className="px-4 pt-3 pb-3">
      <View className="bg-card rounded-xl px-4 py-3 flex-row items-center shadow-sm">
        <FontAwesome name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          className="flex-1 ml-3 text-base text-foreground"
          placeholder="Search events..."
          placeholderTextColor={colors.mutedForeground}
          value={searchInput}
          onChangeText={setSearchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            className="ml-2 p-1"
          >
            <FontAwesome name="times-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /**
   * Renders individual event item
   */
  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={handleEventPress}
    />
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="text-muted-foreground mt-4">Loading events...</Text>
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-card rounded-2xl p-8 shadow-sm items-center">
        <View className="w-20 h-20 bg-destructive/10 rounded-full items-center justify-center mb-4">
          <FontAwesome name="exclamation-circle" size={40} color={colors.destructive} />
        </View>
        <Text className="text-xl font-semibold text-foreground mb-2">
          Unable to load events
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => fetchEvents()}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-primary-foreground font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renders empty state when no events are available
   */
  const renderEmpty = () => {
    const isSearching = searchQuery.trim().length > 0;
    
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-card rounded-2xl p-8 shadow-sm items-center">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <FontAwesome 
              name={isSearching ? "search" : "calendar"} 
              size={40} 
              color={colors.primary} 
            />
          </View>
          <Text className="text-xl font-semibold text-foreground mb-2">
            {isSearching ? 'No events found' : 'No events available'}
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            {isSearching 
              ? `No events match "${searchQuery}". Try adjusting your search terms.`
              : 'There are no events available at the moment. Check back later for exciting events near you!'
            }
          </Text>
          {isSearching ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-primary-foreground font-medium">Clear Search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => fetchEvents()}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-primary-foreground font-medium">Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /**
   * Renders event statistics
   */
  const renderEventStats = () => {
    const totalEvents = getEventsCount();
    const upcomingEvents = getUpcomingEvents();
    const isSearching = searchQuery.trim().length > 0;
    
    if (totalEvents === 0) return null;

    return (
      <View className="px-4 pb-3">
        <Text className="text-sm text-muted-foreground">
          {isSearching && `Found ${totalEvents} events • `}
          {totalEvents} events • {upcomingEvents.length} upcoming
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Header 
        title="Events" 
        showAddFriend={false} 
        showMoreOptions={true}
        onMoreOptionsPress={() => {
          // TODO: Implement events options menu
          console.log('Events options pressed');
        }}
      />
      
      <View className="flex-1">
        {renderSearchInput()}
        {renderEventStats()}
        
        {/* Main content area */}
        {isLoading && events.length === 0 ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : events.length > 0 ? (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && events.length > 0}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          renderEmpty()
        )}
      </View>
    </View>
  );
} 