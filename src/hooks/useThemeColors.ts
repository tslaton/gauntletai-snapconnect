import { useThemeStore } from '@/stores/theme';

/**
 * Hook to get theme-aware colors for use in React Native components
 * Returns color values based on the current theme
 */
export function useThemeColors() {
  const { currentTheme } = useThemeStore();

  // Define colors for light and dark themes
  const colors = {
    light: {
      foreground: '#111827', // gray-900
      background: '#F9FAFB', // gray-50
      card: '#FFFFFF', // white
      cardForeground: '#111827', // gray-900
      primary: '#6B21A8', // purple-800 (dark purple)
      primaryForeground: '#FFFFFF', // white
      secondary: '#F3F4F6', // gray-100
      secondaryForeground: '#111827', // gray-900
      muted: '#F3F4F6', // gray-100
      mutedForeground: '#6B7280', // gray-500
      accent: '#FAF5FF', // purple-50
      accentForeground: '#581C87', // purple-900
      destructive: '#EF4444', // red-500
      destructiveForeground: '#FFFFFF', // white
      affirmative: '#16A34A', // green-600
      affirmativeForeground: '#FFFFFF', // white
      border: '#E5E7EB', // gray-200
      input: '#E5E7EB', // gray-200
      ring: '#6B21A8', // purple-800 (dark purple)
    },
    dark: {
      foreground: '#F9FAFB', // gray-50
      background: '#111827', // gray-900
      card: '#1F2937', // gray-800
      cardForeground: '#F9FAFB', // gray-50
      primary: '#84CC16', // lime-500
      primaryForeground: '#000000', // black for better contrast with lime
      secondary: '#1F2937', // gray-800
      secondaryForeground: '#F9FAFB', // gray-50
      muted: '#374151', // gray-700
      mutedForeground: '#9CA3AF', // gray-400
      accent: '#1F2937', // gray-800
      accentForeground: '#BEF264', // lime-300
      destructive: '#FA8072', // salmon
      destructiveForeground: '#000000', // black for contrast with salmon
      affirmative: '#3EB489', // mint green
      affirmativeForeground: '#000000', // black for contrast
      border: '#374151', // gray-700
      input: '#374151', // gray-700
      ring: '#A3E635', // lime-400
    },
  };

  return colors[currentTheme];
}