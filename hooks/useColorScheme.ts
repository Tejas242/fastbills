import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  return useNativeColorScheme() as 'light' | 'dark';
}
