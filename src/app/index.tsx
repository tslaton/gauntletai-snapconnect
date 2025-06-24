import Auth from '@/components/Auth'
import { supabase } from '@/utils/supabase'
import { FontAwesome } from '@expo/vector-icons'
import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useUserStore } from '../stores/user'

/**
 * Main app component that handles authentication and navigation
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const { currentUser, fetchCurrentUser, clearUser } = useUserStore()
  console.log('currentUser from store: ', currentUser)

  // Fetch the current user when the session changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchCurrentUser(session)
      } else {
        clearUser()
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchCurrentUser(session)
      } else {
        // Clear user data when session ends (logout)
        clearUser()
      }
    })
  }, [fetchCurrentUser, clearUser])

  /**
   * Renders the user avatar or placeholder
   */
  const renderAvatar = () => {
    if (currentUser?.avatarUrl) {
      return (
        <Image
          source={{ uri: currentUser.avatarUrl }}
          className="w-10 h-10 rounded-full"
          resizeMode="cover"
        />
      );
    }
    
    return (
      <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
        <FontAwesome name="user" size={16} color="#6B7280" />
      </View>
    );
  };

  /**
   * Renders the authenticated user interface with navigation
   */
  const renderAuthenticatedUI = () => (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-6">
          <View className="flex-row items-center">
            {/* Avatar Button */}
            <TouchableOpacity
              onPress={() => router.push('/account')}
              className="mr-4"
            >
              {renderAvatar()}
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">SnapConnect</Text>
              <Text className="text-gray-500 mt-1">Connect with friends</Text>
            </View>
          </View>
        </View>

        {/* Navigation Options */}
        <View className="flex-1 px-4 py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Friend Management</Text>
          
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg mb-3 flex-row items-center"
            onPress={() => router.push('/friends/search')}
          >
            <FontAwesome name="search" size={20} color="white" />
            <Text className="text-white font-semibold ml-3 text-base">Find Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 p-4 rounded-lg mb-3 flex-row items-center"
            onPress={() => router.push('/friends/requests')}
          >
            <FontAwesome name="user-plus" size={20} color="white" />
            <Text className="text-white font-semibold ml-3 text-base">Friend Requests</Text>
          </TouchableOpacity>

          {/* Welcome Message */}
          <View className="mt-8 bg-white p-4 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900">
              Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ''}!
            </Text>
            <Text className="text-gray-500 mt-1">
              Start connecting with friends by searching for them or managing your friend requests.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <View className="flex-1">
      {session && session.user ? renderAuthenticatedUI() : <Auth />}
    </View>
  )
}