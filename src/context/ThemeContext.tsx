/**
 * Theme Context
 * 
 * Provides theme switching functionality with system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from '../theme/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  theme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'split-money-theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Load from localStorage or default to 'system'
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeMode) || 'system';
  });

  // Determine actual theme based on mode and system preference
  const actualTheme = useMemo(() => {
    if (mode === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return mode;
  }, [mode, prefersDarkMode]);

  // Save to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    if (mode === 'system') {
      // If system mode, toggle to opposite of current system preference
      setModeState(prefersDarkMode ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setModeState(mode === 'light' ? 'dark' : 'light');
    }
  }, [mode, prefersDarkMode]);

  const value = useMemo(
    () => ({
      mode,
      theme: actualTheme,
      setMode,
      toggleTheme,
    }),
    [mode, actualTheme, setMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={actualTheme === 'dark' ? darkTheme : lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

