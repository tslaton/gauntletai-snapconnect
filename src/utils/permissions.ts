/**
 * Permissions utilities for handling device permissions
 * Provides functions for requesting and checking camera permissions with user-friendly messaging
 */

import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  expires?: string | number;
}

/**
 * Requests camera permission from the user
 * @returns Promise<PermissionResult> - The permission result with status and additional info
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    const result = await Camera.requestCameraPermissionsAsync();
    
    return {
      status: result.status,
      canAskAgain: result.canAskAgain,
      expires: result.expires,
    };
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
}

/**
 * Checks current camera permission status without requesting
 * @returns Promise<PermissionResult> - The current permission status
 */
export async function checkCameraPermission(): Promise<PermissionResult> {
  try {
    const result = await Camera.getCameraPermissionsAsync();
    
    return {
      status: result.status,
      canAskAgain: result.canAskAgain,
      expires: result.expires,
    };
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
}

/**
 * Handles camera permission with user-friendly messaging and fallbacks
 * @returns Promise<boolean> - True if permission is granted, false otherwise
 */
export async function handleCameraPermission(): Promise<boolean> {
  // First check current permission status
  const currentStatus = await checkCameraPermission();
  
  if (currentStatus.status === 'granted') {
    return true;
  }
  
  // If permission is denied and we can't ask again, show settings alert
  if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
    showPermissionDeniedAlert();
    return false;
  }
  
  // Request permission if we can ask
  const requestResult = await requestCameraPermission();
  
  if (requestResult.status === 'granted') {
    return true;
  }
  
  // Handle denied permission
  if (requestResult.status === 'denied') {
    if (requestResult.canAskAgain) {
      showPermissionExplanationAlert();
    } else {
      showPermissionDeniedAlert();
    }
  }
  
  return false;
}

/**
 * Shows alert when permission is denied and can't be requested again
 * Directs user to settings to enable camera permission
 */
function showPermissionDeniedAlert(): void {
  const settingsText = Platform.OS === 'ios' ? 'Settings' : 'App Settings';
  
  Alert.alert(
    'Camera Permission Required',
    `To take photos, please enable camera access in ${settingsText}. Go to ${settingsText} > SnapConnect > Camera and enable camera access.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          // Note: Opening settings requires expo-linking and platform-specific handling
          // This can be implemented in a future enhancement
          console.log('Opening settings...');
        },
      },
    ]
  );
}

/**
 * Shows alert explaining why camera permission is needed
 * Used when permission is denied but can be requested again
 */
function showPermissionExplanationAlert(): void {
  Alert.alert(
    'Camera Access Needed',
    'SnapConnect needs camera access to let you take photos and apply effects. This allows you to capture and share moments directly in the app.',
    [
      {
        text: 'Maybe Later',
        style: 'cancel',
      },
      {
        text: 'Grant Access',
        onPress: async () => {
          await requestCameraPermission();
        },
      },
    ]
  );
}

/**
 * Utility function to check if camera is available on the device
 * @returns Promise<boolean> - True if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  try {
    const { status } = await checkCameraPermission();
    return status !== 'denied';
  } catch (error) {
    console.error('Error checking camera availability:', error);
    return false;
  }
} 