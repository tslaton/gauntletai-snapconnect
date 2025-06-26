import { Session } from '@supabase/supabase-js';
import { Redirect, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import Auth from "../components/Auth";
import { useUserStore } from "../stores/user";
import { supabase } from "../utils/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCurrentUser, clearUser } = useUserStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session);
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCurrentUser, clearUser]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="account" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
      
      {/* Auth Modal Overlay */}
      <Modal
        visible={!session}
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
      >
        <View className="flex-1">
          <Auth />
        </View>
      </Modal>
      
      {/* Redirect to tabs if authenticated */}
      {session && <Redirect href="/(tabs)/map" />}
    </SafeAreaProvider>
  );
}
