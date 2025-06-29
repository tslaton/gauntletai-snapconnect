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
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import Spacer from '@/components/Spacer';
import { useItinerariesStore } from '@/stores/itinerariesStore';
import { uploadItineraryCover, deleteItineraryCover } from '@/utils/itineraryImageUpload';
import { supabase } from '@/utils/supabase';
import type { Itinerary, CreateItineraryData, UpdateItineraryData } from '@/api/itineraries';

interface ItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  itinerary?: Itinerary | null;
  onSave?: (itinerary: Itinerary) => void;
}

export function ItineraryModal({ visible, onClose, itinerary, onSave }: ItineraryModalProps) {
  const colors = useThemeColors();
  const { createItinerary, updateItinerary, deleteItinerary } = useItinerariesStore();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [oldImagePath, setOldImagePath] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({});

  const isEditMode = !!itinerary;

  useEffect(() => {
    if (itinerary) {
      setTitle(itinerary.title);
      setDescription(itinerary.description || '');
      setStartDate(itinerary.start_time ? new Date(itinerary.start_time) : null);
      setEndDate(itinerary.end_time ? new Date(itinerary.end_time) : null);
      setCoverImageUrl(itinerary.cover_image_url || null);
      setOldImagePath(null);
    } else {
      resetForm();
    }
  }, [itinerary, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(null);
    setEndDate(null);
    setCoverImageUrl(null);
    setOldImagePath(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; dates?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.dates = 'End date must be after start date';
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
        aspect: [16, 9],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Generate a temporary ID for new itineraries
        const itineraryId = itinerary?.id || `temp_${Date.now()}`;

        // Upload the image
        const uploadResult = await uploadItineraryCover(
          asset.uri,
          itineraryId,
          user.id
        );

        if (uploadResult.success && uploadResult.publicUrl) {
          // Keep track of old image to delete later if this is an update
          if (coverImageUrl && coverImageUrl !== uploadResult.publicUrl) {
            setOldImagePath(uploadResult.filePath || null);
          }
          setCoverImageUrl(uploadResult.publicUrl);
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

      const data: CreateItineraryData | UpdateItineraryData = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startDate?.toISOString() || undefined,
        end_time: endDate?.toISOString() || undefined,
        cover_image_url: coverImageUrl || undefined,
      };

      let savedItinerary: Itinerary;

      if (isEditMode && itinerary) {
        savedItinerary = await updateItinerary(itinerary.id, data);
        
        // Delete old image if it was replaced
        if (oldImagePath) {
          await deleteItineraryCover(oldImagePath);
        }
      } else {
        savedItinerary = await createItinerary(data as CreateItineraryData);
      }

      if (onSave) {
        onSave(savedItinerary);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving itinerary:', error);
      Alert.alert(
        'Error',
        isEditMode ? 'Failed to update itinerary' : 'Failed to create itinerary'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itinerary) return;

    Alert.alert(
      'Delete Itinerary',
      `Are you sure you want to delete "${itinerary.title}"? This will also delete all activities in this itinerary. This action cannot be undone.`,
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
              await deleteItinerary(itinerary.id);
              
              // Delete associated image if exists
              if (itinerary.cover_image_url) {
                const imagePath = itinerary.cover_image_url.split('/').slice(-2).join('/');
                await deleteItineraryCover(imagePath);
              }
              
              resetForm();
              onClose();
              
              // Navigate back to itineraries list
              router.replace('/itineraries');
            } catch (error) {
              console.error('Error deleting itinerary:', error);
              Alert.alert('Error', 'Failed to delete itinerary');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    // On Android, hide picker after selection
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Clear end date if it's before the new start date
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    // On Android, hide picker after selection
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
      // Clear start date if it's after the new end date
      if (startDate && selectedDate < startDate) {
        setStartDate(null);
      }
      setErrors({ ...errors, dates: undefined });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text className="text-muted-foreground text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              {isEditMode ? 'Edit Itinerary' : 'New Itinerary'}
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
        <ScrollView className="flex-1">
          {/* Cover Image */}
          <TouchableOpacity
            onPress={() => {
              setShowStartPicker(false);
              setShowEndPicker(false);
              handleSelectImage();
            }}
            disabled={isUploadingImage}
            className="h-48 bg-muted m-4 rounded-lg overflow-hidden"
          >
            {coverImageUrl ? (
              <Image source={{ uri: coverImageUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
                <Text className="text-muted-foreground mt-2">Tap to add cover image</Text>
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
                onFocus={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
                placeholder="Give your itinerary a name"
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
                placeholder="What's this itinerary about?"
                placeholderTextColor={colors.mutedForeground}
                className="bg-muted px-3 py-3 rounded-lg text-foreground"
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Start Date */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">Start Date</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEndPicker(false);
                  setShowStartPicker(true);
                }}
                className="bg-muted px-3 py-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className={startDate ? 'text-foreground' : 'text-muted-foreground'}>
                  {startDate ? formatDate(startDate) : 'Select start date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* End Date */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-1">End Date</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(true);
                }}
                className="bg-muted px-3 py-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className={endDate ? 'text-foreground' : 'text-muted-foreground'}>
                  {endDate ? formatDate(endDate) : 'Select end date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {errors.dates && (
              <Text className="text-destructive text-sm">{errors.dates}</Text>
            )}
          </View>
        </ScrollView>

        {/* Delete Button - Only in Edit Mode, fixed at bottom */}
        {isEditMode && (
          <View className="px-4">
            <View className="items-center">
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isLoading}
                className="px-8 py-2 rounded-lg border border-destructive"
              >
                <Text className="text-destructive text-center font-medium">
                  Delete Itinerary
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer size={96} />
          </View>
        )}

        {/* Date Pickers */}
        {showStartPicker && (
          <>
            {Platform.OS === 'ios' && (
              <TouchableWithoutFeedback onPress={() => setShowStartPicker(false)}>
                <View className="absolute inset-0 bg-black/30" style={{ zIndex: 999 }}>
                  <TouchableWithoutFeedback>
                    <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
                      <View className="flex-row justify-between items-center px-4 py-2">
                        <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                          <Text className="text-primary text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-foreground font-medium">Start Date</Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                          <Text className="text-primary text-base font-medium">Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleStartDateChange}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
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
                        <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                          <Text className="text-primary text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-foreground font-medium">End Date</Text>
                        <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                          <Text className="text-primary text-base font-medium">Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleEndDateChange}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}