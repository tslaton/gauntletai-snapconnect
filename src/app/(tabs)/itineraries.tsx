import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useItinerariesStore } from '@/stores/itinerariesStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ItineraryCard } from '@/components/ItineraryCard';
import { ItineraryModal } from '@/components/ItineraryModal';
import { AIItineraryPromptModal } from '@/components/AIItineraryPromptModal';
import { Header } from '@/components/Header';
import MoreOptionsMenu from '@/components/MoreOptionsMenu';
import type { Itinerary } from '@/api/itineraries';

export default function ItinerariesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);
  
  const {
    itineraries,
    isLoading,
    error,
    fetchItineraries,
    searchItineraries,
    clearError
  } = useItinerariesStore();

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      searchItineraries(debouncedSearch);
    } else {
      fetchItineraries();
    }
  }, [debouncedSearch]);

  const handleNewItinerary = () => {
    setEditingItinerary(null);
    setShowCreateModal(true);
  };

  const handleAIItinerary = () => {
    setShowAIPromptModal(true);
  };

  const handleItinerarySaved = (itinerary: Itinerary) => {
    // Only navigate to the itinerary if it's newly created
    if (!editingItinerary) {
      router.push(`/itineraries/${itinerary.id}`);
    }
    // For edits, just refresh the list
    fetchItineraries();
  };

  const handleItineraryPress = (itineraryId: string) => {
    router.push(`/itineraries/${itineraryId}`);
  };

  const handleItineraryLongPress = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setShowCreateModal(true);
  };

  const handleMoreOptions = () => {
    setShowMoreOptions(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (debouncedSearch) {
        await searchItineraries(debouncedSearch);
      } else {
        await fetchItineraries();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const renderItinerary = ({ item }: { item: Itinerary }) => {
    return (
      <ItineraryCard 
        itinerary={item} 
        onPress={handleItineraryPress}
        onLongPress={handleItineraryLongPress}
      />
    );
  };

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <Header title="Itineraries" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-destructive text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              fetchItineraries();
            }}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-primary-foreground">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header title="Itineraries" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
      <View className="flex-1 px-4 pt-4">
        {/* Search Bar and New Button */}
        <View className="flex-row mb-4 items-center">
          <View className="bg-muted rounded-lg px-3 py-2 flex-row items-center flex-1 mr-2">
            <Ionicons name="search" size={20} color={colors.mutedForeground} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Search itineraries..."
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 ml-2 text-foreground"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={handleAIItinerary}
            className="bg-primary/10 px-3 py-2 rounded-full flex-row items-center mr-2 border border-primary"
          >
            <FontAwesome name="magic" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNewItinerary}
            className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          >
            <FontAwesome name="plus" size={14} color={colors.primaryForeground} />
            <Text className="text-primary-foreground font-semibold ml-2">New</Text>
          </TouchableOpacity>
        </View>

        {/* Itineraries List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={itineraries}
            renderItem={renderItinerary}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons name="calendar-outline" size={64} color={colors.mutedForeground} />
                <Text className="text-muted-foreground text-center mt-4">
                  {searchInput ? 'No itineraries found' : 'No itineraries yet'}
                </Text>
                <Text className="text-muted-foreground text-center mt-2">
                  Tap &quot;+ New&quot; to create your first travel plan
                </Text>
              </View>
            }
            ListFooterComponent={
              itineraries.length > 0 ? (
                <View className="py-4 px-4">
                  <Text className="text-xs text-muted-foreground text-center">
                    Tip: Long press an itinerary to edit it
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Create/Edit Itinerary Modal */}
      <ItineraryModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItinerary(null);
        }}
        itinerary={editingItinerary}
        onSave={handleItinerarySaved}
      />

      {/* More Options Menu */}
      <MoreOptionsMenu
        visible={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        context="itineraries"
        onNewItinerary={handleNewItinerary}
      />

      {/* AI Itinerary Prompt Modal */}
      <AIItineraryPromptModal
        visible={showAIPromptModal}
        onClose={() => setShowAIPromptModal(false)}
        onItineraryCreated={() => fetchItineraries()}
      />
    </View>
  );
}