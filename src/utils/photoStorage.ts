/**
 * Photo storage utilities for Supabase Storage
 * Handles photo upload, compression, and URL generation for sharing
 */

import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export interface PhotoUploadResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

export interface PhotoUploadOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // Default 1920
  maxHeight?: number; // Default 1920
  compress?: boolean; // Default true
}

/**
 * Uploads a photo to Supabase Storage with optional compression
 * @param photoUri - Local photo URI from camera or image picker
 * @param userId - Current user ID for organizing uploads
 * @param options - Upload options for compression and quality
 * @returns Promise with upload result and public URL
 */
export async function uploadPhoto(
  photoUri: string,
  userId: string,
  options: PhotoUploadOptions = {}
): Promise<PhotoUploadResult> {
  try {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1920,
      compress = true,
    } = options;

    const timestamp = Date.now();
    // Reverting to JPEG for smaller file sizes and faster uploads.
    const fileName = `${userId}_${timestamp}.jpg`;
    const filePath = `${userId}/${fileName}`;

    let processedUri = photoUri;

    if (compress) {
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: maxWidth, height: maxHeight } }],
          // Using JPEG format for compression. The quality is controlled by the 'compress' option (0-1).
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        processedUri = manipulatedImage.uri;
      } catch (compressionError) {
        console.warn('Photo compression failed, using original:', compressionError);
      }
    }

    const base64 = await FileSystem.readAsStringAsync(processedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 string directly into binary data using Buffer. This approach avoids the
    // React-Native fetch(data-URI) limitations that produced 0-byte Blobs.
    const binary = Buffer.from(base64, 'base64');

    const mimeType = 'image/jpeg';

    // Get the underlying ArrayBuffer from the Buffer.
    // This is necessary because React Native's Blob polyfill doesn't support
    // creating blobs from ArrayBufferViews (like Buffers).
    // Supabase's uploader can accept an ArrayBuffer directly.
    const arrayBuffer = binary.buffer.slice(
      binary.byteOffset,
      binary.byteOffset + binary.byteLength
    );

    // Upload the ArrayBuffer to Supabase Storage.
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    if (!data) {
      return { success: false, error: 'Upload failed: No data returned' };
    }

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to generate public URL' };
    }

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      filePath,
    };
  } catch (error) {
    console.error('Photo upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deletes a photo from Supabase Storage
 * @param filePath - The file path in storage (e.g., 'photos/user123/photo.jpg')
 * @returns Promise with deletion result
 */
export async function deletePhoto(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (error) {
      console.error('Photo deletion error:', error);
      return {
        success: false,
        error: `Deletion failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Photo deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error',
    };
  }
}

/**
 * Gets a public URL for a photo in storage
 * @param filePath - The file path in storage
 * @returns Public URL or null if failed
 */
export function getPhotoUrl(filePath: string): string | null {
  try {
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting photo URL:', error);
    return null;
  }
}

/**
 * Uploads multiple photos in batch
 * @param photoUris - Array of local photo URIs
 * @param userId - Current user ID
 * @param options - Upload options
 * @returns Promise with array of upload results
 */
export async function uploadMultiplePhotos(
  photoUris: string[],
  userId: string,
  options: PhotoUploadOptions = {}
): Promise<PhotoUploadResult[]> {
  const uploadPromises = photoUris.map(uri => uploadPhoto(uri, userId, options));
  return Promise.all(uploadPromises);
}

/**
 * Validates photo file before upload
 * @param photoUri - Local photo URI
 * @returns Validation result with error message if invalid
 */
export async function validatePhoto(photoUri: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if file exists and is accessible
    const response = await fetch(photoUri);
    
    if (!response.ok) {
      return {
        valid: false,
        error: 'Photo file is not accessible',
      };
    }

    const blob = await response.blob();
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (blob.size > maxSize) {
      return {
        valid: false,
        error: 'Photo is too large (max 10MB)',
      };
    }

    // Check if it's an image
    if (!blob.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'File is not a valid image',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Photo validation failed',
    };
  }
} 