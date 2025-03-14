import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'subtitle' | 'title' | 'defaultSemiBold' | 'small';
}

export function ThemedText({ style, type = 'default', children, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  
  return (
    <Text
      style={[
        styles.base,
        { color: colors.text },
        type === 'subtitle' && styles.subtitle,
        type === 'title' && styles.title,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'small' && styles.small,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  small: {
    fontSize: 12,
  },
});
