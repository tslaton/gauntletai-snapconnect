import { CameraPermissions } from '@/components/Camera/CameraPermissions';
import { CameraView } from '@/components/Camera/CameraView';
import { Header } from '@/components/Header';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

export default function CameraTab() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Manage tab focus state and StatusBar
  useFocusEffect(
    useCallback(() => {
      // Tab is focused - activate camera and set dark status bar
      setIsFocused(true);
      
      return () => {
        // Tab is unfocused - deactivate camera and reset status bar
        setIsFocused(false);
      };
    }, [])
  );

  const handlePermissionGranted = () => {
    setHasPermission(true);
  };

  const handlePermissionDenied = () => {
    // For tabs, we don't navigate away on permission denial
    // User can still access other tabs
  };

  const handleGoBack = () => {
    // In tab context, this could switch to another tab
    // For now, we'll just ignore it as tabs handle their own navigation
  };

  const handleMoreOptions = () => {
    // TODO: Implement popover menu for camera options
    console.log('More options pressed for Camera tab');
  }

  const handlePhotoTaken = (photoUri: string) => {
    router.push({
      pathname: '/camera/edit',
      params: { photoUri }
    });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Only show camera-specific StatusBar when tab is focused */}
      {isFocused && <StatusBar style="light" backgroundColor="#000000" />}
      
      <View className="flex-1 relative">
        <View className="absolute top-0 left-0 right-0 z-10">
          <Header transparent />
        </View>
        
        {/* Only render camera when tab is focused and has permission */}
        {isFocused ? (
          <CameraPermissions
            onPermissionGranted={handlePermissionGranted}
            onPermissionDenied={handlePermissionDenied}
          >
            {hasPermission && (
              <CameraView
                onGoBack={handleGoBack}
                onPhotoTaken={handlePhotoTaken}
              />
            )}
          </CameraPermissions>
        ) : (
          <View className="flex-1 items-center justify-center">
            {/* Placeholder when not focused - camera is inactive */}
          </View>
        )}
      </View>
    </View>
  );
}