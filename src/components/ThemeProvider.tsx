import { useThemeStore } from '@/stores/theme';
import React from 'react';
import { View } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme } = useThemeStore();

  return (
    <View className={`flex-1 ${currentTheme === 'dark' ? 'dark' : ''}`}>
      <View className="flex-1 bg-background">
        {children}
      </View>
    </View>
  );
}