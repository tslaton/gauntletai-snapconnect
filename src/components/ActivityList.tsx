import React from 'react';
import { View, Text, SectionList, SectionListData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ActivityCard } from './ActivityCard';
import { groupActivitiesByDay, getDayLabel, calculateDayNumber } from '@/utils/dateHelpers';
import type { Activity } from '@/api/activities';

interface ActivityListProps {
  activities: Activity[];
  onActivityPress: (activity: Activity) => void;
  itineraryStartDate?: string | null;
}

interface GroupedActivity {
  title: string;
  data: Activity[];
}

export function ActivityList({ activities, onActivityPress, itineraryStartDate }: ActivityListProps) {
  const colors = useThemeColors();

  const getGroupedActivities = (): GroupedActivity[] => {
    // Separate scheduled and unscheduled activities
    const scheduledActivities = activities.filter(a => a.start_time);
    const unscheduledActivities = activities.filter(a => !a.start_time);

    // Use the dateHelpers function to group activities
    const grouped = groupActivitiesByDay(scheduledActivities);
    
    // Create sections array
    const sections: GroupedActivity[] = [];
    
    // Sort days chronologically
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach((dateKey) => {
      const dayNumber = itineraryStartDate 
        ? calculateDayNumber(dateKey, itineraryStartDate)
        : null;
      
      const title = getDayLabel(dateKey, dayNumber);
      
      sections.push({
        title,
        data: grouped[dateKey]
      });
    });

    // Add unscheduled section if there are any
    if (unscheduledActivities.length > 0) {
      sections.push({
        title: 'Not scheduled',
        data: unscheduledActivities
      });
    }

    return sections;
  };

  const renderSectionHeader = ({ section }: { section: SectionListData<Activity, GroupedActivity> }) => (
    <View className="bg-background px-4 py-2">
      <Text className="text-lg font-semibold text-foreground">
        {section.title}
      </Text>
    </View>
  );

  const renderActivity = ({ item }: { item: Activity }) => (
    <View className="px-4">
      <ActivityCard activity={item} onPress={onActivityPress} />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-4">
      <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
      <Text className="text-muted-foreground text-center mt-4 text-base">
        No activities yet
      </Text>
      <Text className="text-muted-foreground text-center mt-2">
        Tap the + button to add activities to your itinerary
      </Text>
    </View>
  );

  const sections = getGroupedActivities();

  if (activities.length === 0) {
    return renderEmptyState();
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderActivity}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={true}
      contentContainerStyle={{ paddingBottom: 20 }}
      SectionSeparatorComponent={() => <View className="h-2" />}
    />
  );
}