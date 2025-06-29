import type { Activity, CreateActivityData, UpdateActivityData } from '@/api/activities';
import { parseTagsString, tagsToString } from '@/api/activities';
import { fillActivityDataWithAI, generateActivityImageWithAI } from '@/api/ai';
import { getItinerary } from '@/api/itineraries';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useActivitiesStore } from '@/stores/activitiesStore';
import { deletePhoto, uploadPhoto } from '@/utils/photoStorage';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  activity?: Activity | null;
  itineraryId: string;
  onSave?: (activity: Activity) => void;
}

export function ActivityModal({ visible, onClose, activity, itineraryId, onSave }: ActivityModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { createActivity, updateActivity, deleteActivity } = useActivitiesStore();

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
  const [imageError, setImageError] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState<'date' | 'time'>('date');
  const [endPickerMode, setEndPickerMode] = useState<'date' | 'time'>('date');
  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({});
  const [isFillingWithAI, setIsFillingWithAI] = useState(false);

  // Track keyboard visibility to conditionally hide bottom actions
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDateTime(null);
    setEndDateTime(null);
    setImageUrl(null);
    setTagsText('');
    setOldImagePath(null);
    setImageError(false);
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

        // Upload the image
        const uploadResult = await uploadPhoto(
          asset.uri,
          user.id,
          { 
            quality: 0.85, 
            maxWidth: 1280, 
            maxHeight: 1280, 
            compress: true,
            mimeType: asset.mimeType
          }
        );

        if (uploadResult.success && uploadResult.publicUrl) {
          // Keep track of old image to delete later if this is an update
          if (imageUrl && imageUrl !== uploadResult.publicUrl) {
            // Extract the old image path from the existing URL
            const oldPath = imageUrl.split('/').slice(-2).join('/');
            setOldImagePath(oldPath);
          }
          setImageUrl(uploadResult.publicUrl);
          setImageError(false);
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

      let savedActivity: Activity;

      if (isEditMode && activity) {
        // For updates, explicitly set null for cleared fields
        const updateData: UpdateActivityData = {
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          start_time: startDateTime?.toISOString() || null,
          end_time: endDateTime?.toISOString() || null,
          image_url: imageUrl || null,
          tags: tags,  // Always send the array, even if empty
        };
        savedActivity = await updateActivity(activity.id, updateData);
        
        // Delete old image if it was replaced
        if (oldImagePath) {
          await deletePhoto(oldImagePath);
        }
      } else {
        const createData: CreateActivityData = {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          start_time: startDateTime?.toISOString() || undefined,
          end_time: endDateTime?.toISOString() || undefined,
          image_url: imageUrl || undefined,
          tags: tags,  // Always send the array, even if empty
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

  const handleDelete = async () => {
    if (!activity) return;

    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${activity.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteActivity(activity.id);
              
              // Delete associated image if exists
              if (activity.image_url) {
                const imagePath = activity.image_url.split('/').slice(-2).join('/');
                await deletePhoto(imagePath);
              }
              
              resetForm();
              onClose();
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFillWithAI = async () => {
    try {
      setIsFillingWithAI(true);
      
      // Get itinerary context
      const itinerary = await getItinerary(itineraryId);
      if (!itinerary) {
        Alert.alert('Error', 'Could not load itinerary information');
        return;
      }

      // Prepare current activity data
      const currentActivity: Partial<Activity> = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        tags: parseTagsString(tagsText).length > 0 ? parseTagsString(tagsText) : undefined,
        image_url: imageUrl || undefined,
      };

      // Make parallel requests for data and image
      const promises: Promise<any>[] = [];
      
      // Request 1: Get AI suggestions for activity data
      const needsDataFill = !title.trim() || !description.trim() || !location.trim() || parseTagsString(tagsText).length === 0;
      if (needsDataFill) {
        promises.push(fillActivityDataWithAI(currentActivity, itinerary));
      }
      
      // Request 2: Generate AI image if no image exists
      const needsImage = !imageUrl;
      if (needsImage) {
        promises.push(generateActivityImageWithAI(currentActivity, itinerary));
      }

      if (promises.length === 0) {
        Alert.alert('Info', 'All fields are already filled');
        return;
      }

      const results = await Promise.allSettled(promises);
      
      // Process data suggestions
      if (needsDataFill && results[0]?.status === 'fulfilled') {
        const dataSuggestions = (results[0] as PromiseFulfilledResult<any>).value;
        
        // Apply suggestions only for empty fields
        if (dataSuggestions.title && !title.trim()) {
          setTitle(dataSuggestions.title);
        }
        if (dataSuggestions.description && !description.trim()) {
          setDescription(dataSuggestions.description);
        }
        if (dataSuggestions.location && !location.trim()) {
          setLocation(dataSuggestions.location);
        }
        if (dataSuggestions.tags && parseTagsString(tagsText).length === 0) {
          setTagsText(tagsToString(dataSuggestions.tags));
        }
      } else if (needsDataFill && results[0]?.status === 'rejected') {
        console.error('Failed to get data suggestions:', results[0].reason);
      }
      
      // Process image generation
      const imageResultIndex = needsDataFill ? 1 : 0;
      if (needsImage && results[imageResultIndex]?.status === 'fulfilled') {
        const imageResult = (results[imageResultIndex] as PromiseFulfilledResult<any>).value;
        if (imageResult.image_url) {
          setImageUrl(imageResult.image_url);
          setImageError(false);
        }
      } else if (needsImage && results[imageResultIndex]?.status === 'rejected') {
        console.error('Failed to generate image:', results[imageResultIndex].reason);
      }

      // Only alert on failure, success is evident from the filled fields
      const dataSuccess = needsDataFill && results[0]?.status === 'fulfilled';
      const imageSuccess = needsImage && results[imageResultIndex]?.status === 'fulfilled';
      
      if (!dataSuccess && !imageSuccess) {
        Alert.alert('Error', 'Failed to get AI suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error filling with AI:', error);
      Alert.alert('Error', 'Failed to get AI suggestions. Please try again.');
    } finally {
      setIsFillingWithAI(false);
    }
  };

  const handleStartDateTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      setStartDateTime(selectedDate);
      // Clear end date/time if it's before the new start date/time
      if (endDateTime && selectedDate > endDateTime) {
        setEndDateTime(null);
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const handleEndDateTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      setEndDateTime(selectedDate);
      // Clear start date/time if it's after the new end date/time
      if (startDateTime && selectedDate < startDateTime) {
        setStartDateTime(null);
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
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
        keyboardVerticalOffset={Platform.select({ ios: 60 + insets.top, android: 0 })}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text className="text-muted-foreground text-base">Cancel</Text>
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
        </View>

        {/* Form */}
        <KeyboardAwareScrollView
          className="flex-1"
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={32}
          contentContainerStyle={{
            paddingBottom:
              !keyboardVisible
                ? (isEditMode ? 140 + insets.bottom : 80 + insets.bottom) // leave room for AI Fill and Delete buttons
                : 32 + insets.bottom,
          }}
        >
          {/* Activity Image */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => {
                setShowStartPicker(false);
                setShowEndPicker(false);
                handleSelectImage();
              }}
              disabled={isUploadingImage}
              className="h-48 bg-muted m-4 rounded-lg overflow-hidden"
            >
              {imageUrl && !imageError ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  className="w-full h-full" 
                  resizeMode="cover"
                  onError={() => {
                    console.error('ActivityModal - Failed to load image:', imageUrl);
                    setImageError(true);
                  }}
                  onLoad={() => setImageError(false)}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground mt-2">
                    {imageError ? 'Failed to load image' : 'Tap to add photo'}
                  </Text>
                </View>
              )}
              {isUploadingImage && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primaryForeground} />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Remove Image Button */}
            {imageUrl && !isUploadingImage && (
              <TouchableOpacity
                onPress={() => {
                  setImageUrl(null);
                  setImageError(false);
                  // Mark the old image for deletion on save
                  if (activity?.image_url && !oldImagePath) {
                    setOldImagePath(activity.image_url);
                  }
                }}
                className="absolute top-6 left-6 bg-black/60 rounded-full p-2"
                style={{ zIndex: 10 }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

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
                onFocus={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
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
                onFocus={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
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
                onFocus={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
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
                  Keyboard.dismiss();
                  setShowEndPicker(false);
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
                  Keyboard.dismiss();
                  setShowStartPicker(false);
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
                onFocus={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
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
        </KeyboardAwareScrollView>

        {/* AI Fill button overlay */}
        {!keyboardVisible && (
          <View
            className="absolute left-0 right-0 px-4"
            style={{ bottom: isEditMode ? 72 + insets.bottom : 16 + insets.bottom }}
          >
            <View className="items-center">
              <TouchableOpacity
                onPress={handleFillWithAI}
                disabled={isLoading || isFillingWithAI || !title.trim()}
                className={`px-8 py-2 rounded-lg border flex-row items-center ${
                  !title.trim() 
                    ? 'border-muted bg-muted opacity-50' 
                    : 'border-primary bg-primary/10'
                }`}
              >
                {isFillingWithAI ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons 
                      name="color-wand" 
                      size={18} 
                      color={!title.trim() ? colors.mutedForeground : colors.primary} 
                    />
                    <Text className={`text-center font-medium ml-2 ${
                      !title.trim() ? 'text-muted-foreground' : 'text-primary'
                    }`}>
                      Fill with AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delete button overlay – outside scroll so layout doesn't shift */}
        {isEditMode && !keyboardVisible && (
          <View
            className="absolute left-0 right-0 px-4"
            style={{ bottom: 16 + insets.bottom }}
          >
            <View className="items-center">
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isLoading}
                className="px-8 py-2 rounded-lg border border-destructive bg-background"
              >
                <Text className="text-destructive text-center font-medium">
                  Delete Activity
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Date/Time Pickers */}
        {showStartPicker && (
          <>
            {Platform.OS === 'ios' && (
              <TouchableWithoutFeedback onPress={() => setShowStartPicker(false)}>
                <View className="absolute inset-0 bg-black/30" style={{ zIndex: 999 }}>
                  <TouchableWithoutFeedback>
                    <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
                      <View className="flex-row justify-between items-center px-4 py-2">
                        <TouchableOpacity 
                          onPress={() => {
                            setShowStartPicker(false);
                            setStartPickerMode('date');
                          }}
                        >
                          <Text className="text-primary text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-foreground font-medium">
                          {startPickerMode === 'date' ? 'Start Date' : 'Start Time'}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => {
                            if (startPickerMode === 'date') {
                              setStartPickerMode('time');
                            } else {
                              setShowStartPicker(false);
                              setStartPickerMode('date');
                            }
                          }}
                        >
                          <Text className="text-primary text-base font-medium">
                            {startPickerMode === 'date' ? 'Next' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={startDateTime || new Date()}
                        mode={startPickerMode}
                        display="spinner"
                        onChange={handleStartDateTimeChange}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={startDateTime || new Date()}
                mode={startPickerMode}
                display="default"
                onChange={handleStartDateTimeChange}
              />
            )}
          </>
        )}

        {showEndPicker && (
          <>
            {Platform.OS === 'ios' && (
              <TouchableWithoutFeedback onPress={() => setShowEndPicker(false)}>
                <View className="absolute inset-0 bg-black/30" style={{ zIndex: 999 }}>
                  <TouchableWithoutFeedback>
                    <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
                      <View className="flex-row justify-between items-center px-4 py-2">
                        <TouchableOpacity 
                          onPress={() => {
                            setShowEndPicker(false);
                            setEndPickerMode('date');
                          }}
                        >
                          <Text className="text-primary text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-foreground font-medium">
                          {endPickerMode === 'date' ? 'End Date' : 'End Time'}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => {
                            if (endPickerMode === 'date') {
                              setEndPickerMode('time');
                            } else {
                              setShowEndPicker(false);
                              setEndPickerMode('date');
                            }
                          }}
                        >
                          <Text className="text-primary text-base font-medium">
                            {endPickerMode === 'date' ? 'Next' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={endDateTime || new Date()}
                        mode={endPickerMode}
                        display="spinner"
                        onChange={handleEndDateTimeChange}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={endDateTime || new Date()}
                mode={endPickerMode}
                display="default"
                onChange={handleEndDateTimeChange}
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}