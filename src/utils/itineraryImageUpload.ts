/**
 * @file Image upload utilities for itineraries and activities
 * Extends the base photo storage utilities for specific itinerary features
 */

import { uploadPhoto, deletePhoto, getPhotoUrl, PhotoUploadResult, PhotoUploadOptions } from './photoStorage';
import { supabase } from './supabase';

/**
 * Storage bucket names for different image types
 */
const STORAGE_BUCKETS = {
  ITINERARY_COVERS: 'itinerary-covers',
  ACTIVITY_IMAGES: 'activity-images',
} as const;

/**
 * Ensures the required storage buckets exist
 * Should be called during app initialization
 */
export async function ensureStorageBucketsExist(): Promise<void> {
  try {
    // Check and create itinerary-covers bucket
    const { data: itineraryBucket } = await supabase.storage.getBucket(STORAGE_BUCKETS.ITINERARY_COVERS);
    if (!itineraryBucket) {
      await supabase.storage.createBucket(STORAGE_BUCKETS.ITINERARY_COVERS, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Check and create activity-images bucket
    const { data: activityBucket } = await supabase.storage.getBucket(STORAGE_BUCKETS.ACTIVITY_IMAGES);
    if (!activityBucket) {
      await supabase.storage.createBucket(STORAGE_BUCKETS.ACTIVITY_IMAGES, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
    }
  } catch (error) {
    console.error('Error ensuring storage buckets exist:', error);
  }
}

/**
 * Uploads an itinerary cover image
 * @param imageUri - Local image URI from camera or image picker
 * @param itineraryId - ID of the itinerary
 * @param userId - Current user ID
 * @returns Promise with upload result and public URL
 */
export async function uploadItineraryCover(
  imageUri: string,
  itineraryId: string,
  userId: string
): Promise<PhotoUploadResult> {
  try {
    // Use existing photo upload function with specific options
    const uploadResult = await uploadPhoto(imageUri, userId, {
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1080,
      compress: true,
    });

    if (!uploadResult.success || !uploadResult.filePath) {
      return uploadResult;
    }

    // Move the uploaded file to the itinerary-covers bucket
    const timestamp = Date.now();
    const fileName = `${itineraryId}_${timestamp}.jpg`;
    const newFilePath = `${userId}/${fileName}`;

    // Copy from photos bucket to itinerary-covers bucket
    const { data: fileData } = await supabase.storage
      .from('photos')
      .download(uploadResult.filePath);

    if (!fileData) {
      return { success: false, error: 'Failed to retrieve uploaded file' };
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ITINERARY_COVERS)
      .upload(newFilePath, fileData, {
        contentType: 'image/jpeg',
        upsert: true, // Allow updating existing cover
      });

    if (error) {
      return { success: false, error: `Failed to store cover image: ${error.message}` };
    }

    // Delete from photos bucket
    await deletePhoto(uploadResult.filePath);

    // Get public URL from itinerary-covers bucket
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.ITINERARY_COVERS)
      .getPublicUrl(newFilePath);

    return {
      success: true,
      publicUrl: urlData?.publicUrl,
      filePath: newFilePath,
    };
  } catch (error) {
    console.error('Itinerary cover upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Uploads an activity image
 * @param imageUri - Local image URI from camera or image picker
 * @param activityId - ID of the activity
 * @param userId - Current user ID
 * @returns Promise with upload result and public URL
 */
export async function uploadActivityImage(
  imageUri: string,
  activityId: string,
  userId: string
): Promise<PhotoUploadResult> {
  try {
    // Use existing photo upload function with specific options
    const uploadResult = await uploadPhoto(imageUri, userId, {
      quality: 0.85,
      maxWidth: 1280,
      maxHeight: 1280,
      compress: true,
    });

    if (!uploadResult.success || !uploadResult.filePath) {
      return uploadResult;
    }

    // Move the uploaded file to the activity-images bucket
    const timestamp = Date.now();
    const fileName = `${activityId}_${timestamp}.jpg`;
    const newFilePath = `${userId}/${fileName}`;

    // Copy from photos bucket to activity-images bucket
    const { data: fileData } = await supabase.storage
      .from('photos')
      .download(uploadResult.filePath);

    if (!fileData) {
      return { success: false, error: 'Failed to retrieve uploaded file' };
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ACTIVITY_IMAGES)
      .upload(newFilePath, fileData, {
        contentType: 'image/jpeg',
        upsert: true, // Allow updating existing image
      });

    if (error) {
      return { success: false, error: `Failed to store activity image: ${error.message}` };
    }

    // Delete from photos bucket
    await deletePhoto(uploadResult.filePath);

    // Get public URL from activity-images bucket
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.ACTIVITY_IMAGES)
      .getPublicUrl(newFilePath);

    return {
      success: true,
      publicUrl: urlData?.publicUrl,
      filePath: newFilePath,
    };
  } catch (error) {
    console.error('Activity image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deletes an itinerary cover image
 * @param filePath - The file path in storage
 * @returns Promise with deletion result
 */
export async function deleteItineraryCover(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.ITINERARY_COVERS)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: `Cover deletion failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error',
    };
  }
}

/**
 * Deletes an activity image
 * @param filePath - The file path in storage
 * @returns Promise with deletion result
 */
export async function deleteActivityImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.ACTIVITY_IMAGES)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: `Image deletion failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error',
    };
  }
}

/**
 * Gets a public URL for an itinerary cover image
 * @param filePath - The file path in storage
 * @returns Public URL or null if failed
 */
export function getItineraryCoverUrl(filePath: string): string | null {
  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.ITINERARY_COVERS)
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting itinerary cover URL:', error);
    return null;
  }
}

/**
 * Gets a public URL for an activity image
 * @param filePath - The file path in storage
 * @returns Public URL or null if failed
 */
export function getActivityImageUrl(filePath: string): string | null {
  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.ACTIVITY_IMAGES)
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting activity image URL:', error);
    return null;
  }
}