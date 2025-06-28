import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemeMode, useThemeStore } from '@/stores/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function ThemeSettings() {
  const { themeMode, setThemeMode } = useThemeStore();
  const colors = useThemeColors();

  const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', label: 'System', description: 'Follow system theme' },
  ];

  return (
    <View className="px-6 py-6 max-w-md mx-auto w-full">
      <Text className="text-lg font-semibold text-foreground mb-4">Theme</Text>
      <View className="bg-card rounded-lg border border-border">
        {themeOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setThemeMode(option.value)}
            className={`flex-row items-center justify-between p-4 ${
              index < themeOptions.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <View className="flex-1 pr-4">
              <Text className="text-base font-medium text-foreground">
                {option.label}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {option.description}
              </Text>
            </View>
            {themeMode === option.value && (
              <FontAwesome name="check" size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}