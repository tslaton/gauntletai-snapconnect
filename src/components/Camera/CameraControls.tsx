/**
 * Camera controls component with capture button and camera switching
 * Provides the main camera interaction UI with modern design
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraType } from 'expo-camera';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CameraControlsProps {
  onCapture: () => void;
  onToggleCamera: () => void;
  isCapturing: boolean;
  cameraType: CameraType;
  effectEnabled: boolean;
}

/**
 * Camera controls component providing capture and camera switching functionality
 * @param onCapture - Callback for photo capture
 * @param onToggleCamera - Callback for switching between front/back camera
 * @param isCapturing - Whether photo capture is in progress
 * @param cameraType - Current camera type (front/back)
 * @param effectEnabled - Whether blur effect is currently enabled
 */
export function CameraControls({ 
  onCapture, 
  onToggleCamera, 
  isCapturing, 
  cameraType,
  effectEnabled 
}: CameraControlsProps) {

  return (
    <View className="flex-row items-center justify-between px-8 py-4">
      {/* Gallery/Recent Photos Button (placeholder for future) */}
      <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
        <Ionicons name="images-outline" size={24} color="#ffffff" />
      </View>

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
  );
} 