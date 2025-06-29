import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemeMode, useThemeStore } from '@/stores/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function CompactThemeSelector() {
  const { themeMode, setThemeMode } = useThemeStore();
  const colors = useThemeColors();

  const themeOptions: { value: ThemeMode; icon: string; label: string }[] = [
    { value: 'light', icon: 'sun-o', label: 'Light' },
    { value: 'dark', icon: 'moon-o', label: 'Dark' },
    { value: 'system', icon: 'desktop', label: 'System' },
  ];

  return (
    <View>
      <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Theme</Text>
      <View className="flex-row bg-muted rounded-xl p-1">
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setThemeMode(option.value)}
            className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${
              themeMode === option.value ? 'bg-card shadow-sm' : ''
            }`}
          >
            <FontAwesome
              name={option.icon}
              size={16}
              color={themeMode === option.value ? colors.foreground : colors.mutedForeground}
            />
            <Text
              className={`ml-2 text-sm font-medium ${
                themeMode === option.value ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}