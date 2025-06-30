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
import { createActivityFromPrompt, generateActivityImageWithAI } from '@/api/ai';
import { createActivity } from '@/api/activities';
import type { Itinerary } from '@/api/itineraries';
import type { CreateActivityData } from '@/api/activities';

interface AIActivityPromptModalProps {
  visible: boolean;
  onClose: () => void;
  itinerary: Itinerary;
  onActivityCreated: () => void;
}

export function AIActivityPromptModal({
  visible,
  onClose,
  itinerary,
  onActivityCreated,
}: AIActivityPromptModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please describe the activity you want to create');
      return;
    }

    try {
      setIsLoading(true);

      // Generate activity data from prompt
      const activityData = await createActivityFromPrompt(prompt.trim(), itinerary);

      // Create the activity data object
      const createData: CreateActivityData = {
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        tags: activityData.tags,
        itinerary_id: itinerary.id,
      };

      // Create the activity (this will also enrich with GPS and weather)
      const createdActivity = await createActivity(createData);

      // Generate image for the activity in the background
      generateActivityImageWithAI(
        {
          title: createdActivity.title,
          description: createdActivity.description,
          location: createdActivity.location,
          tags: createdActivity.tags,
        },
        itinerary
      ).then(async (imageResult) => {
        if (imageResult.image_url) {
          // Update the activity with the generated image
          const { updateActivity } = await import('@/api/activities');
          await updateActivity(createdActivity.id, {
            image_url: imageResult.image_url,
          });
          // Refresh the activities list
          onActivityCreated();
        }
      }).catch((error) => {
        console.error('Failed to generate image for activity:', error);
      });

      // Clear form and close modal
      setPrompt('');
      onClose();
      
      // Refresh the activities list
      onActivityCreated();
    } catch (error) {
      console.error('Error creating activity from prompt:', error);
      Alert.alert('Error', 'Failed to create activity. Please try again.');
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
              Create Activity with AI
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
            Describe the kind of activity you&apos;d like to do (e.g., sightseeing, hiking, dining)
          </Text>
          
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="I want to explore local street food markets and try authentic cuisine..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-muted p-3 rounded-lg text-foreground h-32"
            editable={!isLoading}
          />
          
          <Text className="text-muted-foreground text-sm mt-2">
            Be specific about what you want to do, and AI will create a complete activity with location, description, and tags.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}