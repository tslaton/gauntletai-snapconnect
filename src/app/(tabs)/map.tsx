import { Header } from '@/components/Header';
import { useActivitiesStore } from '@/stores/activitiesStore';
import { useItinerariesStore } from '@/stores/itinerariesStore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

export default function MapScreen() {
  const { itineraries, fetchItineraries } = useItinerariesStore();
  const { activities, fetchActivitiesForItinerary, getActivitiesForItinerary } = useActivitiesStore();
  const [isLoading, setIsLoading] = useState(true);
  const [markers, setMarkers] = useState<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
  }[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleMoreOptions = () => {
    // TODO: Implement popover menu for map options
    console.log('More options pressed for Map tab');
  };

  useEffect(() => {
    loadActivities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all itineraries first
      await fetchItineraries();
      
      // Fetch activities for each itinerary
      const allMarkers = [];
      for (const itinerary of itineraries) {
        await fetchActivitiesForItinerary(itinerary.id);
      }
      
      // Now process all activities
      for (const itinerary of itineraries) {
        const itineraryActivities = getActivitiesForItinerary(itinerary.id);
        
        // Filter activities with GPS coordinates
        const activitiesWithCoords = itineraryActivities.filter(
          activity => activity.gps_coords && activity.gps_coords.length === 2
        );
        
        // Map to marker format
        const itineraryMarkers = activitiesWithCoords.map(activity => ({
          id: activity.id,
          coordinate: {
            latitude: activity.gps_coords![0],
            longitude: activity.gps_coords![1],
          },
          title: activity.title,
          description: `${itinerary.title}${activity.location ? ' - ' + activity.location : ''}`,
        }));
        
        allMarkers.push(...itineraryMarkers);
      }
      
      setMarkers(allMarkers);
      
      // Update map region to center on activities if any exist
      if (allMarkers.length > 0) {
        const latitudes = allMarkers.map(m => m.coordinate.latitude);
        const longitudes = allMarkers.map(m => m.coordinate.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        // Add some padding to the deltas
        const latDelta = Math.max(0.0922, (maxLat - minLat) * 1.2);
        const lngDelta = Math.max(0.0421, (maxLng - minLng) * 1.2);
        
        setMapRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        });
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Map" showAddFriend showMoreOptions onMoreOptionsPress={handleMoreOptions} />
      <View style={styles.container}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text className="text-muted-foreground mt-2">Loading activities...</Text>
          </View>
        ) : markers.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-xl font-semibold text-foreground mb-2">No Activities to Show</Text>
            <Text className="text-muted-foreground text-center">
              Add activities with locations to your itineraries to see them on the map
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
              />
            ))}
          </MapView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});