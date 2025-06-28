import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useActivitiesStore } from '@/stores/activitiesStore';
import { uploadActivityImage, deleteActivityImage } from '@/utils/itineraryImageUpload';
import { parseTagsString, tagsToString } from '@/api/activities';
import { supabase } from '@/utils/supabase';
import type { Activity, CreateActivityData, UpdateActivityData } from '@/api/activities';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  activity?: Activity | null;
  itineraryId: string;
  onSave?: (activity: Activity) => void;
}

export function ActivityModal({ visible, onClose, activity, itineraryId, onSave }: ActivityModalProps) {
  const colors = useThemeColors();
  const { createActivity, updateActivity } = useActivitiesStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tagsText, setTagsText] = useState('');
  const [oldImagePath, setOldImagePath] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState<'date' | 'time'>('date');
  const [endPickerMode, setEndPickerMode] = useState<'date' | 'time'>('date');
  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({});

  const isEditMode = !!activity;

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description || '');
      setLocation(activity.location || '');
      setStartDateTime(activity.start_time ? new Date(activity.start_time) : null);
      setEndDateTime(activity.end_time ? new Date(activity.end_time) : null);
      setImageUrl(activity.image_url || null);
      setTagsText(activity.tags ? tagsToString(activity.tags) : '');
      setOldImagePath(null);
    } else {
      resetForm();
    }
  }, [activity, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDateTime(null);
    setEndDateTime(null);
    setImageUrl(null);
    setTagsText('');
    setOldImagePath(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; dates?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (startDateTime && endDateTime && startDateTime > endDateTime) {
      newErrors.dates = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectImage = async () => {
    try {
      setIsUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Generate a temporary ID for new activities
        const activityId = activity?.id || `temp_${Date.now()}`;

        // Upload the image
        const uploadResult = await uploadActivityImage(
          asset.uri,
          activityId,
          user.id
        );

        if (uploadResult.success && uploadResult.publicUrl) {
          // Keep track of old image to delete later if this is an update
          if (imageUrl && imageUrl !== uploadResult.publicUrl) {
            setOldImagePath(uploadResult.filePath || null);
          }
          setImageUrl(uploadResult.publicUrl);
        } else {
          Alert.alert('Upload Error', uploadResult.error || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const tags = parseTagsString(tagsText);

      const data: CreateActivityData | UpdateActivityData = {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time: startDateTime?.toISOString() || undefined,
        end_time: endDateTime?.toISOString() || undefined,
        image_url: imageUrl || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      let savedActivity: Activity;

      if (isEditMode && activity) {
        savedActivity = await updateActivity(activity.id, data);
        
        // Delete old image if it was replaced
        if (oldImagePath) {
          await deleteActivityImage(oldImagePath);
        }
      } else {
        const createData: CreateActivityData = {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          start_time: startDateTime?.toISOString() || undefined,
          end_time: endDateTime?.toISOString() || undefined,
          image_url: imageUrl || undefined,
          tags: tags.length > 0 ? tags : undefined,
          itinerary_id: itineraryId,
        };
        savedActivity = await createActivity(createData);
      }

      if (onSave) {
        onSave(savedActivity);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(
        'Error',
        isEditMode ? 'Failed to update activity' : 'Failed to create activity'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      if (startPickerMode === 'date' && Platform.OS === 'ios') {
        setStartDateTime(selectedDate);
        setStartPickerMode('time');
      } else {
        setStartDateTime(selectedDate);
        setShowStartPicker(false);
        setStartPickerMode('date');
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const handleEndDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      if (endPickerMode === 'date' && Platform.OS === 'ios') {
        setEndDateTime(selectedDate);
        setEndPickerMode('time');
      } else {
        setEndDateTime(selectedDate);
        setShowEndPicker(false);
        setEndPickerMode('date');
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text className="text-primary text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Edit Activity' : 'New Activity'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className={`text-base ${title.trim() ? 'text-primary' : 'text-muted-foreground'}`}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Activity Image */}
          <TouchableOpacity
            onPress={handleSelectImage}
            disabled={isUploadingImage}
            className="h-48 bg-muted m-4 rounded-lg overflow-hidden"
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
                <Text className="text-muted-foreground mt-2">Tap to add photo</Text>
              </View>
            )}
            {isUploadingImage && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primaryForeground} />
              </View>
            )}
          </TouchableOpacity>

          <View className="px-4 space-y-4">
            {/* Title */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Title *</Text>
              <TextInput
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="What are you doing?"
                placeholderTextColor={colors.mutedForeground}
                className="bg-muted px-3 py-3 rounded-lg text-foreground"
                maxLength={100}
              />
              {errors.title && (
                <Text className="text-destructive text-sm mt-1">{errors.title}</Text>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details..."
                placeholderTextColor={colors.mutedForeground}
                className="bg-muted px-3 py-3 rounded-lg text-foreground"
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Location */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Where is this happening?"
                placeholderTextColor={colors.mutedForeground}
                className="bg-muted px-3 py-3 rounded-lg text-foreground"
                maxLength={200}
              />
            </View>

            {/* Start Date/Time */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Start Time</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStartPicker(true);
                  setStartPickerMode('date');
                }}
                className="bg-muted px-3 py-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className={startDateTime ? 'text-foreground' : 'text-muted-foreground'}>
                  {startDateTime ? formatDateTime(startDateTime) : 'Select start time'}
                </Text>
                <Ionicons name="time-outline" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* End Date/Time */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">End Time</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEndPicker(true);
                  setEndPickerMode('date');
                }}
                className="bg-muted px-3 py-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className={endDateTime ? 'text-foreground' : 'text-muted-foreground'}>
                  {endDateTime ? formatDateTime(endDateTime) : 'Select end time'}
                </Text>
                <Ionicons name="time-outline" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {errors.dates && (
              <Text className="text-destructive text-sm">{errors.dates}</Text>
            )}

            {/* Tags */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Tags</Text>
              <TextInput
                value={tagsText}
                onChangeText={setTagsText}
                placeholder="food; shopping; museum (separate with semicolons)"
                placeholderTextColor={colors.mutedForeground}
                className="bg-muted px-3 py-3 rounded-lg text-foreground"
                maxLength={200}
              />
              <Text className="text-xs text-muted-foreground mt-1">
                Separate tags with semicolons
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDateTime || new Date()}
            mode={startPickerMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateTimeChange}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDateTime || new Date()}
            mode={endPickerMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}