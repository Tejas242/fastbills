import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  const { colors, isDark } = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        tint={isDark ? 'dark' : 'light'} 
        intensity={100} 
        style={StyleSheet.absoluteFill} 
      />
    );
  }
  
  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: colors.card }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
