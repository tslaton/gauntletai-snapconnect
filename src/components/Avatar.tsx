/**
 * @file Avatar component for displaying and uploading user profile images.
 * Handles image selection, upload to Supabase storage, and display with fallback.
 */

import { supabase } from '@/utils/supabase'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native'

/**
 * Props interface for the Avatar component.
 */
interface AvatarProps {
  /** The size of the avatar in pixels (width and height) */
  size: number
  /** The storage path/URL of the avatar image */
  url: string | null
  /** Callback function called when a new image is successfully uploaded */
  onUpload: (filePath: string) => void
}

/**
 * Avatar component that displays a user's profile image and allows uploading new ones.
 * 
 * @param {AvatarProps} props - The component props
 * @returns {JSX.Element} The rendered Avatar component
 */
export default function Avatar({ url, size = 150, onUpload }: AvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Create dynamic size classes for the avatar
  const avatarSizeStyle = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  /**
   * Downloads an image from Supabase storage and converts it to a data URL.
   * 
   * @param {string} path - The storage path of the image to download
   */
  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)

      if (error) {
        throw error
      }

      const fileReader = new FileReader()
      fileReader.readAsDataURL(data)
      fileReader.onload = () => {
        setAvatarUrl(fileReader.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  /**
   * Handles the avatar upload process including image selection and upload to storage.
   * Uses Expo ImagePicker to allow users to select and crop images.
   */
  async function uploadAvatar() {
    try {
      setIsUploading(true)

      const imagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      })

      if (imagePickerResult.canceled || !imagePickerResult.assets || imagePickerResult.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const selectedImage = imagePickerResult.assets[0]
      console.log('Got image', selectedImage)

      if (!selectedImage.uri) {
        throw new Error('No image uri!')
      }

      const imageArrayBuffer = await fetch(selectedImage.uri).then((res) => res.arrayBuffer())

      const fileExtension = selectedImage.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const storagePath = `${Date.now()}.${fileExtension}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, imageArrayBuffer, {
          contentType: selectedImage.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }

      onUpload(data.path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        throw error
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View className="items-center">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={avatarSizeStyle}
          className="rounded-lg object-cover"
        />
      ) : (
        <View 
          style={avatarSizeStyle}
          className="bg-gray-300 border border-gray-400 rounded-lg"
        />
      )}
      
      <TouchableOpacity
        onPress={uploadAvatar}
        disabled={isUploading}
        className="mt-3 px-4 py-2 bg-blue-600 rounded-md active:bg-blue-700 disabled:bg-gray-400"
      >
        <Text className="text-white text-base font-medium">
          {isUploading ? 'Uploading ...' : 'Upload'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}