import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useStore } from '@/context/StoreContext';
import { loadData, hasData } from '@/utils/storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Loading component to show while initializing data
function AppLoading() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#f8f9fa';
  const loaderColor = colorScheme === 'dark' ? '#219ebc' : '#0a7ea4';
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor 
    }}>
      <ActivityIndicator size="large" color={loaderColor} />
    </View>
  );
}

// This function will be used to check if user is authenticated and handle redirects
function AuthCheck() {
  const { currentUser } = useStore();
  const router = useRouter();
  const segments = useSegments();
  const initialRenderRef = useRef(true);
  
  useEffect(() => {
    // Skip the first render to ensure everything is mounted properly
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    const isLoginScreen = segments[0] === 'login';
    
    // If not logged in and not already on login screen, redirect to login
    if (!currentUser && !isLoginScreen) {
      // Use setTimeout to ensure navigation happens after render is complete
      setTimeout(() => {
        router.replace('/login');
      }, 0);
    }
  }, [currentUser, segments, router]);
  
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load minimal app data to check if setup is needed
        const hasStoredData = await hasData('products');
        
        // If this is a first run, we might want to set up initial data
        if (!hasStoredData) {
          // Any first-run setup logic goes here
          console.log("First app run - setting up initial data");
        }
        
        setIsDataReady(true);
      } catch (e) {
        console.warn('Error preparing app:', e);
        setIsDataReady(true); // Continue anyway
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (loaded && isDataReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isDataReady]);

  if (!loaded || !isDataReady) {
    return <AppLoading />;
  }

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeProvider>
        <StoreProvider>
          <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="bill/[id]" 
              options={{ 
                title: 'Bill Details',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="checkout" 
              options={{ 
                title: 'Checkout',
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="login" 
              options={{ 
                title: 'Login',
                headerShown: false,
                animation: 'fade',
              }} 
            />
            <Stack.Screen name="+not-found" />
            <Stack.Screen 
              name="inventory" 
              options={{ 
                title: 'Inventory Management',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                title: 'Cash Register',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="reports" 
              options={{ 
                title: 'Reports',
                animation: 'slide_from_right',
              }} 
            />
          </Stack>
          <AuthCheck />
          <StatusBar style="auto" />
        </StoreProvider>
      </ThemeProvider>
    </NavThemeProvider>
  );
}
