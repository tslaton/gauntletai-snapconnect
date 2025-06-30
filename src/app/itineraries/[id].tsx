import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useItinerariesStore } from '@/stores/itinerariesStore';
import { useActivitiesStore } from '@/stores/activitiesStore';
import { ActivityList } from '@/components/ActivityList';
import { ActivityModal } from '@/components/ActivityModal';
import { ItineraryModal } from '@/components/ItineraryModal';
import { AIActivityPromptModal } from '@/components/AIActivityPromptModal';
import type { Activity } from '@/api/activities';

export default function ItineraryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filter, setFilter] = useState<'All' | 'Unscheduled'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);

  const { 
    getItineraryById, 
    fetchItinerary,
    error: itineraryError 
  } = useItinerariesStore();

  const {
    getActivitiesForItinerary,
    fetchActivitiesForItinerary,
    isLoading: activitiesLoading,
    error: activitiesError
  } = useActivitiesStore();

  const itinerary = getItineraryById(id);
  const activities = getActivitiesForItinerary(id);

  // Filter activities based on the selected filter
  const filteredActivities = useMemo(() => {
    if (filter === 'Unscheduled') {
      return activities.filter((activity) => !activity.start_time);
    }
    return activities;
  }, [activities, filter]);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchItinerary(id),
          fetchActivitiesForItinerary(id)
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleNewActivity = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleAIActivity = () => {
    setShowAIPromptModal(true);
  };

  const handleMoreOptions = () => {
    setShowItineraryModal(true);
  };

  const handleActivityPress = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleActivitySaved = () => {
    // Refresh activities after save
    fetchActivitiesForItinerary(id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchItinerary(id),
        fetchActivitiesForItinerary(id)
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-card">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const error = itineraryError || activitiesError;
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-card">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-destructive text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-primary-foreground">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView className="flex-1 bg-card">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-muted-foreground text-center">Itinerary not found</Text>
          <TouchableOpacity
            onPress={handleBack}
            className="bg-primary px-4 py-2 rounded-lg mt-4"
          >
            <Text className="text-primary-foreground">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-card">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border bg-card">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={handleBack}
              className="p-2 -ml-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1 ml-2">
              <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                {itinerary.title}
              </Text>
              {itinerary.description && (
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                  {itinerary.description}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleMoreOptions}
            className="p-2 -mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-background">
        <View className="px-4 pt-4">
          {/* Filter/Action Row */}
          <View className="flex-row mb-4 items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setFilter('All')}
                className={`px-4 py-2 rounded-full mr-2 ${
                  filter === 'All' ? 'bg-accent' : 'bg-card'
                }`}
              >
                <Text className={`${filter === 'All' ? 'font-bold text-accent-foreground' : 'font-semibold text-muted-foreground'}`}>
                  All Days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('Unscheduled')}
                className={`px-4 py-2 rounded-full ${
                  filter === 'Unscheduled' ? 'bg-accent' : 'bg-card'
                }`}
              >
                <Text className={`${filter === 'Unscheduled' ? 'font-bold text-accent-foreground' : 'font-semibold text-muted-foreground'}`}>
                  Unscheduled
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleAIActivity}
                className="bg-primary/10 px-3 py-2 rounded-full flex-row items-center mr-2 border border-primary"
              >
                <FontAwesome name="magic" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNewActivity}
                className="bg-primary px-4 py-2 rounded-full flex-row items-center"
              >
                <FontAwesome name="plus" size={14} color={colors.primaryForeground} />
                <Text className="text-primary-foreground font-semibold ml-2">New</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Activities List */}
        {activitiesLoading && !isInitialLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ActivityList
            activities={filteredActivities}
            onActivityPress={handleActivityPress}
            itineraryStartDate={itinerary.start_time}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>

      {/* Activity Modal */}
      {itinerary && (
        <ActivityModal
          visible={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          activity={editingActivity}
          itineraryId={itinerary.id}
          onSave={handleActivitySaved}
        />
      )}

      {/* Itinerary Modal */}
      {itinerary && (
        <ItineraryModal
          visible={showItineraryModal}
          onClose={() => setShowItineraryModal(false)}
          itinerary={itinerary}
          onSave={() => {
            fetchItinerary(id);
          }}
        />
      )}

      {/* AI Activity Prompt Modal */}
      {itinerary && (
        <AIActivityPromptModal
          visible={showAIPromptModal}
          onClose={() => setShowAIPromptModal(false)}
          itinerary={itinerary}
          onActivityCreated={handleActivitySaved}
        />
      )}
    </SafeAreaView>
  );
}