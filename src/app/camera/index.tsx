/**
 * Main camera screen for photo capture and effects
 * Handles camera permissions, navigation, and integrates camera components
 */

import { CameraPermissions } from '@/components/Camera/CameraPermissions';
import { CameraView } from '@/components/Camera/CameraView';
import { Header } from '@/components/Header';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';

/**
 * Main camera screen component
 * Manages the overall camera experience including permissions and navigation
 */
export default function CameraScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Handles successful camera permission grant
   * Enables the camera interface
   */
  const handlePermissionGranted = () => {
    setHasPermission(true);
  };

  /**
   * Handles camera permission denial or cancellation
   * Navigates back to the previous screen
   */
  const handlePermissionDenied = () => {
    router.back();
  };

  /**
   * Handles navigation back from camera
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Handles photo capture completion
   * Navigates to the edit screen with the captured photo
   */
  const handlePhotoTaken = (photoUri: string) => {
    router.push({
      pathname: '/camera/edit',
      params: { photoUri }
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Camera',
          headerShown: false, // Hide header for immersive camera experience
        }}
      />
      
      {/* Use dark status bar for camera */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View className="flex-1 bg-black">
        {/* Overlay Header with transparent background */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <Header
            transparent
            showAddFriend
            showMoreOptions
            onMoreOptionsPress={() => console.log('More options pressed in Camera')}
          />
        </View>

        <CameraPermissions
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        >
          {/* Camera interface is only shown when permission is granted */}
          {hasPermission && (
            <CameraView
              onGoBack={handleGoBack}
              onPhotoTaken={handlePhotoTaken}
            />
          )}
        </CameraPermissions>
      </View>
    </>
  );
} 