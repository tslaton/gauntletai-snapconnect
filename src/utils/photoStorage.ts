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
  bucket?: string; // Storage bucket name, default 'photos'
  mimeType?: string; // MIME type of the image
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
      bucket = 'photos',
      mimeType,
    } = options;

    const timestamp = Date.now();
    
    // Extract file extension from URI or use default based on MIME type
    const uriExtension = photoUri.split('.').pop()?.toLowerCase();
    let fileExtension = uriExtension || 
                        (mimeType?.includes('png') ? 'png' : 'jpeg');
    
    let imageArrayBuffer: ArrayBuffer;
    let contentType = mimeType || (fileExtension === 'png' ? 'image/png' : 'image/jpeg');

    if (compress && (!mimeType || mimeType.startsWith('image/'))) {
      try {
        // First, get the original image dimensions
        const imageInfo = await ImageManipulator.manipulateAsync(
          photoUri,
          [],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        // Calculate if resizing is needed and compute new dimensions
        let resizeOptions: any[] = [];
        if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
          // Calculate scale factor to fit within max dimensions while preserving aspect ratio
          const widthScale = maxWidth / imageInfo.width;
          const heightScale = maxHeight / imageInfo.height;
          const scale = Math.min(widthScale, heightScale);
          
          const newWidth = Math.round(imageInfo.width * scale);
          const newHeight = Math.round(imageInfo.height * scale);
          
          resizeOptions = [{ resize: { width: newWidth, height: newHeight } }];
          console.log(`Resizing image from ${imageInfo.width}x${imageInfo.height} to ${newWidth}x${newHeight}`);
        }
        
        // Apply compression and optional resizing
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photoUri,
          resizeOptions,
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        // Read compressed image as base64
        const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Convert base64 to ArrayBuffer
        const binary = Buffer.from(base64, 'base64');
        imageArrayBuffer = binary.buffer.slice(
          binary.byteOffset,
          binary.byteOffset + binary.byteLength
        );
        
        // Update content type and extension to JPEG after compression
        contentType = 'image/jpeg';
        fileExtension = 'jpeg';
      } catch (compressionError) {
        console.warn('Photo compression failed, using original:', compressionError);
        // Fall back to original image
        imageArrayBuffer = await fetch(photoUri).then((res) => res.arrayBuffer());
      }
    } else {
      // No compression - use original image
      imageArrayBuffer = await fetch(photoUri).then((res) => res.arrayBuffer());
    }

    // Generate final file path with potentially updated extension
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Upload the ArrayBuffer to Supabase Storage.
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, imageArrayBuffer, {
        contentType,
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
      .from(bucket)
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
 * @param filePath - The file path in storage (e.g., 'photos/user123/photo.jpeg')
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
    const fileInfo = await FileSystem.getInfoAsync(photoUri);
    if (!fileInfo.exists) {
      return {
        valid: false,
        error: 'Photo file is not accessible or does not exist.',
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileInfo.size > maxSize) {
      return {
        valid: false,
        error: `Photo is too large (max 10MB). Size: ${Math.round(fileInfo.size / 1024 / 1024)}MB`,
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