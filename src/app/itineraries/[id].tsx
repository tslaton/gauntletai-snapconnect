import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useItinerariesStore } from '@/stores/itinerariesStore';
import { useActivitiesStore } from '@/stores/activitiesStore';
import { ActivityList } from '@/components/ActivityList';
import { ActivityModal } from '@/components/ActivityModal';
import type { Activity } from '@/api/activities';

export default function ItineraryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

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

  const handleActivityPress = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleActivitySaved = () => {
    // Refresh activities after save
    fetchActivitiesForItinerary(id);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchItinerary(id),
      fetchActivitiesForItinerary(id)
    ]);
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const error = itineraryError || activitiesError;
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
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
      <SafeAreaView className="flex-1 bg-background">
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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
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
            onPress={handleNewActivity}
            className="bg-primary px-3 py-2 rounded-lg flex-row items-center ml-2"
          >
            <Ionicons name="add" size={20} color={colors.primaryForeground} />
            <Text className="text-primary-foreground ml-1">New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activities List */}
      {activitiesLoading && !isInitialLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ActivityList
          activities={activities}
          onActivityPress={handleActivityPress}
          itineraryStartDate={itinerary.start_time}
        />
      )}

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
    </SafeAreaView>
  );
}