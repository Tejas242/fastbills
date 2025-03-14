import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useStore();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    // If already logged in, redirect to home
    if (currentUser) {
      router.replace('/');
    }
  }, [currentUser]);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate network request delay
    setTimeout(() => {
      try {
        const user = login(username, password);
        if (user) {
          // Login successful
          router.replace('/');
        } else {
          // Login failed
          Alert.alert('Login Failed', 'Invalid username or password');
          setIsLoading(false);
        }
      } catch (error) {
        Alert.alert('Error', 'Login failed. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ThemedView style={[styles.loginContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="title" style={styles.title}>FastBills</ThemedText>
          <ThemedText style={styles.subtitle}>Supermarket Billing System</ThemedText>
          
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Username"
            placeholderTextColor={colors.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Password"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.buttonText} size="small" />
            ) : (
              <ThemedText style={[styles.loginButtonText, { color: colors.buttonText }]}>
                Login
              </ThemedText>
            )}
          </TouchableOpacity>
          
          <ThemedText style={styles.helpText}>
            Default logins:
          </ThemedText>
          <ThemedText style={styles.helpText}>
            Manager: username "manager" / password "manager123"
          </ThemedText>
          <ThemedText style={styles.helpText}>
            Cashier: username "cashier1" / password "cashier123"
          </ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  title: {
    marginBottom: 8,
    fontSize: 32,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 32,
    opacity: 0.6,
    fontSize: 12,
  }
});
