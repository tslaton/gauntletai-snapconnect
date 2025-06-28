import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useThemeStore } from '@/stores/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, [initializeTheme]);

  return (
    <View className={`flex-1 ${currentTheme === 'dark' ? 'dark' : ''}`}>
      <View className="flex-1 bg-background">
        {children}
      </View>
    </View>
  );
}