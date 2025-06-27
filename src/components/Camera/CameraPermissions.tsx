/**
 * Camera permissions component that handles permission states and user interactions
 * Provides UI feedback and handles permission requests for camera access
 */

import {
  checkCameraPermission,
  handleCameraPermission,
  PermissionStatus
} from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CameraPermissionsProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  children?: React.ReactNode;
}

/**
 * Component that manages camera permissions and displays appropriate UI based on permission state
 * @param onPermissionGranted - Callback when camera permission is granted
 * @param onPermissionDenied - Callback when camera permission is denied
 * @param children - Child components to render when permission is granted
 */
export function CameraPermissions({ 
  onPermissionGranted, 
  onPermissionDenied, 
  children 
}: CameraPermissionsProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * Checks current permission status on component mount
   */
  useEffect(() => {
    checkCurrentPermission();
  }, []);

  /**
   * Checks the current camera permission status
   */
  const checkCurrentPermission = async () => {
    try {
      setIsLoading(true);
      const result = await checkCameraPermission();
      setPermissionStatus(result.status);
      
      if (result.status === 'granted') {
        onPermissionGranted();
      } else if (result.status === 'denied') {
        onPermissionDenied();
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setPermissionStatus('denied');
      onPermissionDenied();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles permission request when user taps the grant access button
   */
  const handlePermissionRequest = async () => {
    try {
      setIsRequesting(true);
      const granted = await handleCameraPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        onPermissionGranted();
      } else {
        setPermissionStatus('denied');
        onPermissionDenied();
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setPermissionStatus('denied');
      onPermissionDenied();
    } finally {
      setIsRequesting(false);
    }
  };

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white text-lg mt-4">Checking camera access...</Text>
      </View>
    );
  }

  // Show permission granted content (camera interface)
  if (permissionStatus === 'granted') {
    return <>{children}</>;
  }

  // Show permission request UI for undetermined status
  if (permissionStatus === 'undetermined') {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Ionicons name="camera-outline" size={120} color="#ffffff" />
        
        <Text className="text-white text-2xl font-bold text-center mt-8 mb-4">
          Camera Access Required
        </Text>
        
        <Text className="text-gray-300 text-base text-center mb-8 leading-6">
          SnapConnect needs access to your camera to take photos and apply effects. 
          Your photos will only be saved when you choose to share them.
        </Text>
        
        <TouchableOpacity
          className={`bg-blue-500 px-8 py-4 rounded-full flex-row items-center ${
            isRequesting ? 'opacity-50' : ''
          }`}
          onPress={handlePermissionRequest}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator size="small" color="#ffffff" className="mr-3" />
          ) : (
            <Ionicons name="camera" size={20} color="#ffffff" className="mr-3" />
          )}
          <Text className="text-white text-lg font-semibold">
            {isRequesting ? 'Requesting Access...' : 'Grant Camera Access'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mt-6 px-4 py-2"
          onPress={onPermissionDenied}
        >
          <Text className="text-gray-400 text-base">Maybe later</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show permission denied UI
  return (
    <View className="flex-1 items-center justify-center bg-black px-8">
      <Ionicons name="close-circle-outline" size={120} color="#ef4444" />
      
      <Text className="text-white text-2xl font-bold text-center mt-8 mb-4">
        Camera Access Denied
      </Text>
      
      <Text className="text-gray-300 text-base text-center mb-8 leading-6">
        To use the camera feature, please enable camera access in your device settings. 
        Go to Settings → SnapConnect → Camera and enable camera access.
      </Text>
      
      <TouchableOpacity
        className="bg-gray-700 px-8 py-4 rounded-full flex-row items-center mb-4"
        onPress={checkCurrentPermission}
      >
        <Ionicons name="refresh" size={20} color="#ffffff" className="mr-3" />
        <Text className="text-white text-lg font-semibold">Check Again</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="mt-2 px-4 py-2"
        onPress={onPermissionDenied}
      >
        <Text className="text-gray-400 text-base">Go back</Text>
      </TouchableOpacity>
    </View>
  );
} 