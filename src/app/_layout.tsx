import Auth from "@/components/Auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user";
import { supabase } from "@/utils/supabase";
import { Session } from '@supabase/supabase-js';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

function ThemedApp({ session }: { session: Session | null }) {
  const { currentTheme } = useThemeStore();

  if (!session) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
        <Auth />
      </View>
    );
  }
  
  return (
    <>
      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
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
    </>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCurrentUser, clearUser } = useUserStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, [initializeTheme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session);
      }
      setIsLoading(false);
    });

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
    return null;
  }
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp session={session} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
