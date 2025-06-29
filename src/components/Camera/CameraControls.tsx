/**
 * Camera controls component with capture button and camera switching
 * Provides the main camera interaction UI with modern design
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface CameraControlsProps {
  onCapture: () => void;
  onToggleCamera: () => void;
  isCapturing: boolean;
  cameraType: CameraType;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPhotoSelected?: (photoUri: string) => void;
}

/**
 * Camera controls component providing capture and camera switching functionality
 * @param onCapture - Callback for photo capture
 * @param onToggleCamera - Callback for switching between front/back camera
 * @param isCapturing - Whether photo capture is in progress
 * @param cameraType - Current camera type (front/back)
 */
export function CameraControls({ 
  onCapture, 
  onToggleCamera, 
  isCapturing, 
  cameraType,
  zoom,
  onZoomChange,
  onPhotoSelected,
}: CameraControlsProps) {
  // Define zoom levels
  const zoomLevels = [
    { label: '1x', value: 0 },      // No zoom
    { label: '2x', value: 0.25 },   // 25% zoom (approximately 2x)
    { label: '5x', value: 0.5 },    // 50% zoom (approximately 5x)
  ];

  const handlePickImage = async () => {
    if (!onPhotoSelected) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  return (
    <View>
      {/* Zoom Controls - centered above shutter button */}
      <View className="flex-row items-center justify-center mb-4">
        {zoomLevels.map((level, index) => (
          <TouchableOpacity
            key={level.label}
            onPress={() => onZoomChange(level.value)}
            disabled={isCapturing}
            className={`mx-2 px-4 py-2 rounded-full ${
              zoom === level.value 
                ? 'bg-white' 
                : 'bg-white/20'
            }`}
          >
            <Text 
              className={`font-semibold ${
                zoom === level.value 
                  ? 'text-black' 
                  : 'text-white'
              }`}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main controls row */}
      <View className="flex-row items-center justify-around px-6 py-4">
        {/* Gallery/Recent Photos Button */}
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isCapturing || !onPhotoSelected}
          className={`w-12 h-12 rounded-xl items-center justify-center ${
            isCapturing || !onPhotoSelected ? 'bg-gray-500/20' : 'bg-white/20'
          }`}
        >
          <Ionicons 
            name="images-outline" 
            size={24} 
            color={isCapturing || !onPhotoSelected ? "#999" : "#ffffff"} 
          />
        </TouchableOpacity>

        {/* Main Capture Button */}
        <View className="items-center">
        <TouchableOpacity
          onPress={onCapture}
          disabled={isCapturing}
          className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${
            isCapturing ? 'bg-gray-400' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isCapturing ? (
            <ActivityIndicator size="large" color="#666" />
          ) : (
            <View className="w-16 h-16 rounded-full bg-white border-2 border-gray-300" />
          )}
        </TouchableOpacity>
        
        {/* Capture button label */}
        <Text className="text-white text-sm mt-2 font-medium">
          {isCapturing ? 'Capturing...' : 'Tap to capture'}
        </Text>
      </View>

        {/* Camera Switch Button */}
        <TouchableOpacity
          onPress={onToggleCamera}
          disabled={isCapturing}
          className={`w-12 h-12 rounded-xl items-center justify-center ${
            isCapturing ? 'bg-gray-500/20' : 'bg-white/20'
          }`}
        >
          <Ionicons 
            name="camera-reverse-outline" 
            size={24} 
            color={isCapturing ? "#999" : "#ffffff"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
} 