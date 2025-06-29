import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createItineraryFromPrompt, generateItineraryImageWithAI } from '@/api/ai';
import { createItinerary } from '@/api/itineraries';
import { createActivity } from '@/api/activities';
import type { CreateItineraryData } from '@/api/itineraries';
import type { CreateActivityData } from '@/api/activities';
import { useRouter } from 'expo-router';

interface AIItineraryPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onItineraryCreated?: () => void;
}

export function AIItineraryPromptModal({
  visible,
  onClose,
  onItineraryCreated,
}: AIItineraryPromptModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please describe the trip you want to plan');
      return;
    }

    try {
      setIsLoading(true);

      // Generate itinerary data from prompt
      const itineraryData = await createItineraryFromPrompt(prompt.trim());

      // Validate dates if provided
      let validStartTime: string | undefined;
      let validEndTime: string | undefined;
      
      if (itineraryData.start_time) {
        const startDate = new Date(itineraryData.start_time);
        if (!isNaN(startDate.getTime())) {
          validStartTime = startDate.toISOString();
        }
      }
      
      if (itineraryData.end_time) {
        const endDate = new Date(itineraryData.end_time);
        if (!isNaN(endDate.getTime())) {
          validEndTime = endDate.toISOString();
        }
      }

      // Create the itinerary
      const createData: CreateItineraryData = {
        title: itineraryData.title,
        description: itineraryData.description,
        start_time: validStartTime,
        end_time: validEndTime,
      };

      const createdItinerary = await createItinerary(createData);

      // Generate image for the itinerary in the background
      generateItineraryImageWithAI({
        title: createdItinerary.title,
        description: createdItinerary.description,
        start_time: createdItinerary.start_time,
        end_time: createdItinerary.end_time,
      }).then(async (imageResult) => {
        if (imageResult.image_url) {
          // Update the itinerary with the generated image
          const { updateItinerary } = await import('@/api/itineraries');
          await updateItinerary(createdItinerary.id, {
            cover_image_url: imageResult.image_url,
          });
        }
      }).catch((error) => {
        console.error('Failed to generate image for itinerary:', error);
      });

      // Create activities in parallel
      if (itineraryData.activities && itineraryData.activities.length > 0) {
        const activityPromises = itineraryData.activities.map(async (activityData) => {
          try {
            // Validate activity dates if provided
            let validActivityStartTime: string | undefined;
            let validActivityEndTime: string | undefined;
            
            if (activityData.start_time) {
              const startDate = new Date(activityData.start_time);
              if (!isNaN(startDate.getTime())) {
                validActivityStartTime = startDate.toISOString();
              }
            }
            
            if (activityData.end_time) {
              const endDate = new Date(activityData.end_time);
              if (!isNaN(endDate.getTime())) {
                validActivityEndTime = endDate.toISOString();
              }
            }

            const createActivityData: CreateActivityData = {
              title: activityData.title,
              description: activityData.description,
              location: activityData.location,
              tags: activityData.tags,
              start_time: validActivityStartTime,
              end_time: validActivityEndTime,
              itinerary_id: createdItinerary.id,
            };

            // Create the activity (this will enrich with GPS and weather)
            const createdActivity = await createActivity(createActivityData);

            // Generate image for each activity in the background
            generateItineraryImageWithAI({
              title: activityData.title,
              description: activityData.description,
            }).then(async (imageResult) => {
              if (imageResult.image_url) {
                const { updateActivity } = await import('@/api/activities');
                await updateActivity(createdActivity.id, {
                  image_url: imageResult.image_url,
                });
              }
            }).catch((error) => {
              console.error('Failed to generate image for activity:', error);
            });

            return createdActivity;
          } catch (error) {
            console.error('Error creating activity:', error);
            return null;
          }
        });

        // Wait for all activities to be created
        await Promise.all(activityPromises);
      }

      // Clear form and close modal
      setPrompt('');
      onClose();
      
      // Notify parent if callback provided
      if (onItineraryCreated) {
        onItineraryCreated();
      }

      // Navigate to the new itinerary
      router.push(`/itineraries/${createdItinerary.id}`);
    } catch (error) {
      console.error('Error creating itinerary from prompt:', error);
      Alert.alert('Error', 'Failed to create itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPrompt('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 60 + insets.top, android: 0 })}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
              <Text className="text-muted-foreground text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              Plan Trip with AI
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  className={`text-base ${
                    prompt.trim() ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          <Text className="text-foreground text-base mb-4">
            Describe your ideal trip (e.g., &quot;5-day Tokyo adventure with food tours and cultural experiences in March 2024&quot;)
          </Text>
          
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="I want to spend a week exploring Paris, visiting museums, trying local cuisine, and experiencing the nightlife..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-muted p-3 rounded-lg text-foreground h-32"
            editable={!isLoading}
          />
          
          <Text className="text-muted-foreground text-sm mt-2">
            Include dates, destinations, and the types of activities you enjoy. AI will create a complete itinerary with a daily schedule.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}