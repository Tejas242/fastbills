import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/context/ThemeContext';

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  const { colors } = useTheme();
  
  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <IconSymbol 
        name={icon} 
        size={80} 
        color={colors.icon || colors.primary} 
        style={styles.icon} 
      />
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    opacity: 0.8,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '80%',
  }
});
