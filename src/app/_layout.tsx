import Auth from "@/components/Auth";
import { useUserStore } from "@/stores/user";
import { supabase } from "@/utils/supabase";
import { Session } from '@supabase/supabase-js';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

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
      {/* Set app to light mode by default for proper status bar display */}
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      {!session ? (
        // Show Auth screen when not authenticated
        <View className="flex-1 bg-gray-50">
          <Auth />
        </View>
      ) : (
        // Show app navigation when authenticated
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
      )}
    </SafeAreaProvider>
  );
}
