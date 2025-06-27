/**
 * @file UserAvatar component for displaying user avatars with SVG support
 * Handles both regular images and SVG avatars (like DiceBear) with proper fallbacks
 */

import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

/**
 * Props for the UserAvatar component
 */
interface UserAvatarProps {
  /** The avatar URL (can be SVG or regular image) */
  uri?: string | null;
  /** Size of the avatar in pixels */
  size?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Fallback when no avatar or loading fails */
  fallbackIcon?: string;
  /** Size of the fallback icon */
  fallbackIconSize?: number;
}

/**
 * Component for displaying user avatars with proper SVG and fallback handling
 * 
 * @param props - Component props
 * @returns JSX element for user avatar
 */
export default function UserAvatar({ 
  uri, 
  size = 48, 
  className = '',
  fallbackIcon = 'user',
  fallbackIconSize
}: UserAvatarProps) {
  // NEW: resolve storage path to public URL if needed
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) {
      setResolvedUri(null);
      return;
    }

    // If uri already looks like a full URL, use it directly
    if (/^https?:\/\//.test(uri)) {
      setResolvedUri(uri);
      return;
    }

    // Otherwise treat it as a Supabase storage path
    try {
      // We avoid async/await because getPublicUrl is synchronous
      const { data } = supabase.storage.from('avatars').getPublicUrl(uri);
      setResolvedUri(data?.publicUrl ?? null);
    } catch (error) {
      console.warn('Failed to resolve avatar URL:', error);
      setResolvedUri(null);
    }
  }, [uri]);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate icon size if not provided
  const iconSize = fallbackIconSize || Math.floor(size * 0.4);
  
  // Size styles
  const sizeStyle = {
    width: size,
    height: size,
  };
  
  // Convert size to Tailwind classes
  const sizeClasses = {
    32: 'w-8 h-8',
    40: 'w-10 h-10',
    48: 'w-12 h-12',
    56: 'w-14 h-14',
    64: 'w-16 h-16',
    96: 'w-24 h-24',
  }[size] || '';

  // Show fallback if no URI or if there was an error
  if (!resolvedUri || hasError) {
    return (
      <View 
        className={`bg-gray-300 rounded-full items-center justify-center ${sizeClasses} ${className}`}
        style={!sizeClasses ? sizeStyle : undefined}
      >
        <FontAwesome name={fallbackIcon as any} size={iconSize} color="#6B7280" />
      </View>
    );
  }

  return (
    <View className={`rounded-full overflow-hidden ${sizeClasses} ${className}`} style={!sizeClasses ? sizeStyle : undefined}>
      <Image
        source={{ uri: resolvedUri }}
        className="w-full h-full bg-gray-200"
        resizeMode="cover"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        defaultSource={{ uri: 'https://www.gravatar.com/avatar/?d=mp' }}
      />
      {isLoading && (
        <View className="absolute inset-0 bg-gray-200" />
      )}
    </View>
  );
}