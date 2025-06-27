/**
 * Camera error handling utilities
 * Provides standardized error handling and user-friendly messaging for camera-related errors
 */

import { Alert } from 'react-native';

export enum CameraErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CAMERA_UNAVAILABLE = 'CAMERA_UNAVAILABLE',
  CAMERA_IN_USE = 'CAMERA_IN_USE',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface CameraError {
  type: CameraErrorType;
  message: string;
  originalError?: Error;
  userMessage: string;
  canRetry: boolean;
}

/**
 * Creates a standardized camera error object
 * @param type - The type of camera error
 * @param message - Technical error message for logging
 * @param originalError - The original error object if available
 * @returns CameraError object with user-friendly messaging
 */
export function createCameraError(
  type: CameraErrorType,
  message: string,
  originalError?: Error
): CameraError {
  const userMessages: Record<CameraErrorType, string> = {
    [CameraErrorType.PERMISSION_DENIED]: 
      'Camera access is required to take photos. Please enable camera permissions in your device settings.',
    [CameraErrorType.CAMERA_UNAVAILABLE]: 
      'Camera is not available on this device or is currently unavailable.',
    [CameraErrorType.CAMERA_IN_USE]: 
      'Camera is currently being used by another app. Please close other camera apps and try again.',
    [CameraErrorType.INITIALIZATION_FAILED]: 
      'Failed to initialize camera. Please try again.',
    [CameraErrorType.CAPTURE_FAILED]: 
      'Failed to capture photo. Please try again.',
    [CameraErrorType.PROCESSING_FAILED]: 
      'Failed to process photo. Please try again.',
    [CameraErrorType.SAVE_FAILED]: 
      'Failed to save photo. Please check your storage space and try again.',
    [CameraErrorType.UNKNOWN_ERROR]: 
      'An unexpected error occurred. Please try again.'
  };

  const retryableErrors = [
    CameraErrorType.CAMERA_IN_USE,
    CameraErrorType.INITIALIZATION_FAILED,
    CameraErrorType.CAPTURE_FAILED,
    CameraErrorType.PROCESSING_FAILED,
    CameraErrorType.SAVE_FAILED,
    CameraErrorType.UNKNOWN_ERROR
  ];

  return {
    type,
    message,
    originalError,
    userMessage: userMessages[type],
    canRetry: retryableErrors.includes(type)
  };
}

/**
 * Handles camera errors by showing appropriate user feedback
 * @param error - The camera error to handle
 * @param onRetry - Callback function for retry action (optional)
 * @param onCancel - Callback function for cancel action (optional)
 */
export function handleCameraError(
  error: CameraError,
  onRetry?: () => void,
  onCancel?: () => void
): void {
  console.error('Camera Error:', {
    type: error.type,
    message: error.message,
    originalError: error.originalError
  });

  const buttons = [];

  // Add cancel button
  if (onCancel) {
    buttons.push({
      text: 'Cancel',
      style: 'cancel' as const,
      onPress: onCancel
    });
  }

  // Add retry button if error is retryable
  if (error.canRetry && onRetry) {
    buttons.push({
      text: 'Try Again',
      onPress: onRetry
    });
  }

  // Add OK button if no actions available
  if (buttons.length === 0) {
    buttons.push({
      text: 'OK',
      style: 'default' as const
    });
  }

  Alert.alert(
    getErrorTitle(error.type),
    error.userMessage,
    buttons
  );
}

/**
 * Gets user-friendly title for error alerts
 * @param errorType - The type of camera error
 * @returns String title for the error alert
 */
function getErrorTitle(errorType: CameraErrorType): string {
  const titles: Record<CameraErrorType, string> = {
    [CameraErrorType.PERMISSION_DENIED]: 'Camera Permission Required',
    [CameraErrorType.CAMERA_UNAVAILABLE]: 'Camera Unavailable',
    [CameraErrorType.CAMERA_IN_USE]: 'Camera In Use',
    [CameraErrorType.INITIALIZATION_FAILED]: 'Camera Error',
    [CameraErrorType.CAPTURE_FAILED]: 'Photo Capture Failed',
    [CameraErrorType.PROCESSING_FAILED]: 'Photo Processing Failed',
    [CameraErrorType.SAVE_FAILED]: 'Save Failed',
    [CameraErrorType.UNKNOWN_ERROR]: 'Unexpected Error'
  };

  return titles[errorType];
}

/**
 * Analyzes an error and determines the appropriate camera error type
 * @param error - The original error to analyze
 * @returns CameraErrorType based on error analysis
 */
export function analyzeCameraError(error: Error): CameraErrorType {
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return CameraErrorType.PERMISSION_DENIED;
  }

  if (errorMessage.includes('unavailable') || errorMessage.includes('not available')) {
    return CameraErrorType.CAMERA_UNAVAILABLE;
  }

  if (errorMessage.includes('in use') || errorMessage.includes('busy')) {
    return CameraErrorType.CAMERA_IN_USE;
  }

  if (errorMessage.includes('initialization') || errorMessage.includes('initialize')) {
    return CameraErrorType.INITIALIZATION_FAILED;
  }

  if (errorMessage.includes('capture')) {
    return CameraErrorType.CAPTURE_FAILED;
  }

  if (errorMessage.includes('process') || errorMessage.includes('filter')) {
    return CameraErrorType.PROCESSING_FAILED;
  }

  if (errorMessage.includes('save') || errorMessage.includes('storage')) {
    return CameraErrorType.SAVE_FAILED;
  }

  return CameraErrorType.UNKNOWN_ERROR;
}

/**
 * Wraps camera operations with error handling
 * @param operation - The camera operation to execute
 * @param onError - Error callback function
 * @returns Promise that resolves to the operation result or handles errors
 */
export async function withCameraErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: CameraError) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const errorType = analyzeCameraError(error as Error);
    const cameraError = createCameraError(
      errorType,
      (error as Error).message,
      error as Error
    );

    if (onError) {
      onError(cameraError);
    } else {
      handleCameraError(cameraError);
    }

    return null;
  }
} 