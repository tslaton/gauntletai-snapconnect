import React from 'react';
import { View, Text, SectionList, SectionListData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ActivityCard } from './ActivityCard';
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

  const groupActivitiesByDay = (): GroupedActivity[] => {
    // Separate scheduled and unscheduled activities
    const scheduledActivities = activities.filter(a => a.start_time);
    const unscheduledActivities = activities.filter(a => !a.start_time);

    // Group scheduled activities by day
    const groupedByDay: { [key: string]: Activity[] } = {};
    
    scheduledActivities.forEach(activity => {
      if (activity.start_time) {
        const date = new Date(activity.start_time);
        const dateKey = date.toDateString();
        
        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = [];
        }
        groupedByDay[dateKey].push(activity);
      }
    });

    // Sort activities within each day by start time
    Object.keys(groupedByDay).forEach(dateKey => {
      groupedByDay[dateKey].sort((a, b) => {
        const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
        const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
        return timeA - timeB;
      });
    });

    // Create sections array
    const sections: GroupedActivity[] = [];
    
    // Sort days chronologically
    const sortedDates = Object.keys(groupedByDay).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Calculate day numbers based on itinerary start date
    let dayCounter = 1;
    const startDate = itineraryStartDate ? new Date(itineraryStartDate) : null;

    sortedDates.forEach((dateKey, index) => {
      const date = new Date(dateKey);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let dayNumber = '';
      if (startDate) {
        const diffTime = date.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        dayNumber = `Day ${diffDays + 1} - `;
      } else {
        dayNumber = `Day ${dayCounter} - `;
        dayCounter++;
      }

      sections.push({
        title: `${dayNumber}${dayName}, ${monthDay}`,
        data: groupedByDay[dateKey]
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

  const sections = groupActivitiesByDay();

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