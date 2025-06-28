/**
 * @file This file contains the Zustand store for managing theme data.
 * It handles theme selection, system theme detection, and persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  // State properties
  themeMode: ThemeMode;
  systemTheme: ColorSchemeName;
  currentTheme: 'light' | 'dark';
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  updateSystemTheme: (theme: ColorSchemeName) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'system',
      systemTheme: Appearance.getColorScheme(),
      currentTheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',

      // Actions
      setThemeMode: (mode) => {
        set({ themeMode: mode });
        
        // Update current theme based on mode
        const systemTheme = get().systemTheme;
        const currentTheme = mode === 'system' 
          ? (systemTheme === 'dark' ? 'dark' : 'light')
          : mode;
        
        set({ currentTheme });
      },
      
      updateSystemTheme: (theme) => {
        set({ systemTheme: theme });
        
        // Update current theme if in system mode
        const themeMode = get().themeMode;
        if (themeMode === 'system') {
          set({ currentTheme: theme === 'dark' ? 'dark' : 'light' });
        }
      },
      
      initializeTheme: () => {
        // Set up system theme listener
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          get().updateSystemTheme(colorScheme);
        });
        
        // Initialize current theme
        const themeMode = get().themeMode;
        const systemTheme = Appearance.getColorScheme();
        const currentTheme = themeMode === 'system' 
          ? (systemTheme === 'dark' ? 'dark' : 'light')
          : themeMode;
        
        set({ systemTheme, currentTheme });
        
        // Return cleanup function
        return () => subscription?.remove();
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);