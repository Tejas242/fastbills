import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  inputBackground: string;
  placeholder: string;
  buttonText: string;
  disabled: string;
  icon: string;
  tableHeader: string;
  tableRow: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: ThemeColors = {
  primary: '#0a7ea4',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#212529',
  border: '#dee2e6',
  notification: '#ff3b30',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  inputBackground: '#f1f3f5',
  placeholder: '#adb5bd',
  buttonText: '#ffffff',
  disabled: '#e9ecef',
  icon: '#687076',
  tableHeader: '#f1f3f5',
  tableRow: '#ffffff'
};

const darkTheme: ThemeColors = {
  primary: '#219ebc',
  background: '#121212',
  card: '#1e1e1e',
  text: '#f8f9fa',
  border: '#343a40',
  notification: '#ff453a',
  error: '#e63946',
  success: '#38c172',
  warning: '#ffba08',
  info: '#3a86ff',
  inputBackground: '#2c2c2c',
  placeholder: '#6c757d',
  buttonText: '#ffffff',
  disabled: '#343a40',
  icon: '#9BA1A6',
  tableHeader: '#222',
  tableRow: '#1e1e1e'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme = {
    colors: isDark ? darkTheme : lightTheme,
    isDark
  };
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
