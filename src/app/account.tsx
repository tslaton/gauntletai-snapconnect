/**
 * @file Account screen for user profile management
 * Provides a dedicated screen for editing user profile information
 */

import Account from '@/components/Account';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';

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
      {/* Screen header configuration - clean style */}
      <Stack.Screen 
        options={{
          title: 'Account',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#4F46E5',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }} 
      />
      
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