import Auth from "@/components/Auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useUserStore } from "@/stores/user";
import { useThemeStore } from "@/stores/theme";
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
  const { currentTheme } = useThemeStore();

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
      <ThemeProvider>
        {/* Dynamic status bar based on theme */}
        <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
        
        {!session ? (
          // Show Auth screen when not authenticated
          <View className="flex-1 bg-background">
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
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
