/**
 * @file Account screen for user profile management
 * Provides a dedicated screen for editing user profile information
 */

import { Session } from '@supabase/supabase-js';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import Account from '../components/Account';
import { supabase } from '../utils/supabase';

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
      
      // Navigate back immediately if no session on mount
      if (!session) {
        router.back();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Navigate back when user signs out (go back to previous screen)
      if (!session) {
        router.back();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything if there's no session (during redirect)
  if (!session) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Screen header configuration - simple overlay style */}
      <Stack.Screen 
        options={{
          title: 'Account',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: 'Back',
        }} 
      />
      
      {/* Main content */}
      <View className="flex-1">
        <Account key={session.user.id} session={session} />
      </View>
    </SafeAreaView>
  );
} 