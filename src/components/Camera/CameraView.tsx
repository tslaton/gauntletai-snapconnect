/**
 * Core camera view component with Expo Camera integration
 * Handles camera preview, switching between front/back cameras, and photo capture
 */

import { CameraControls } from '@/components/Camera/CameraControls';
import { CameraErrorType, createCameraError, withCameraErrorHandling } from '@/utils/cameraErrors';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CameraViewProps {
  onGoBack: () => void;
  onPhotoTaken: (photoUri: string) => void;
}

/**
 * Core camera component that provides camera preview and controls
 * @param onGoBack - Callback for back navigation
 * @param onPhotoTaken - Callback when photo is captured successfully
 */
export function CameraView({ onGoBack, onPhotoTaken }: CameraViewProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [effectEnabled, setEffectEnabled] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  /**
   * Handles camera ready state
   */
  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  /**
   * Toggles between front and back camera
   */
  const toggleCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  /**
   * Toggles the blur effect on/off
   */
  const toggleEffect = () => {
    setEffectEnabled(current => !current);
  };

  /**
   * Captures a photo using the camera
   */
  const capturePhoto = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    await withCameraErrorHandling(async () => {
      setIsCapturing(true);
      
      const photo = await cameraRef.current!.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      } else {
        throw new Error('Failed to capture photo - no URI returned');
      }
    }, (error) => {
      // Custom error handling for photo capture
      if (error.type === CameraErrorType.CAPTURE_FAILED) {
        Alert.alert(
          'Capture Failed',
          'Failed to take photo. Please try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: capturePhoto }
          ]
        );
      }
      setIsCapturing(false);
    });

    setIsCapturing(false);
  };

  /**
   * Handles camera mount errors
   */
  const handleCameraMountError = (error: any) => {
    console.error('Camera mount error:', error);
    const cameraError = createCameraError(
      CameraErrorType.INITIALIZATION_FAILED,
      'Failed to initialize camera',
      error
    );
    
    Alert.alert(
      'Camera Error',
      cameraError.userMessage,
      [
        { text: 'Go Back', onPress: onGoBack }
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera Preview */}
      <View className="flex-1 relative">
        <ExpoCameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={cameraType}
          onCameraReady={handleCameraReady}
          onMountError={handleCameraMountError}
        >
          {/* Loading overlay while camera initializes */}
          {!isCameraReady && (
            <View className="absolute inset-0 bg-black items-center justify-center">
              <Ionicons name="camera-outline" size={80} color="#ffffff" />
              <Text className="text-white text-lg mt-4">Initializing camera...</Text>
            </View>
          )}
          {/* Back button overlay */}
          <View 
            className="absolute top-0 left-0 right-0 flex-row justify-between items-start px-6"
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={onGoBack}
              className="bg-black/30 rounded-full p-3"
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Effect toggle button */}
            <TouchableOpacity
              onPress={toggleEffect}
              className={`rounded-full p-3 ${
                effectEnabled ? 'bg-blue-500' : 'bg-black/30'
              }`}
            >
              <Ionicons 
                name="sparkles" 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </View>

          {/* Effect indicator */}
          {effectEnabled && (
            <View className="absolute top-20 right-6 bg-blue-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-medium">Blur Effect</Text>
            </View>
          )}

          {/* Camera Controls */}
          <View 
            className="absolute bottom-0 left-0 right-0"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <CameraControls
              onCapture={capturePhoto}
              onToggleCamera={toggleCamera}
              isCapturing={isCapturing}
              cameraType={cameraType}
              effectEnabled={effectEnabled}
            />
          </View>
        </ExpoCameraView>
      </View>
    </View>
  );
} 