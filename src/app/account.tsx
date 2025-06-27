/**
 * @file Account screen for user profile management
 * Provides a dedicated screen for editing user profile information
 */

import Account from '@/components/Account';
import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

/**
 * Account screen component
 * 
 * @returns JSX element for the account management screen
 */
export default function AccountScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Don't navigate when signing out - the root layout will handle showing the auth screen
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything if there's no session (during redirect)
  if (!session) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Hide the default header */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      {/* Custom Header */}
      <View className="relative flex-row items-center justify-center p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">Account</Text>
        <TouchableOpacity 
          onPress={() => router.dismiss()}
          className="absolute right-4"
        >
          <FontAwesome name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {/* Main content with keyboard avoiding behavior */}
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1"
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Account key={session.user.id} session={session} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 