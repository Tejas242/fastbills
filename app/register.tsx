import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const { currentUser, cashRegister, openRegister, closeRegister } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      // Redirect to login if not logged in
      router.replace('/login');
    }
  }, [currentUser]);

  const handleOpenRegister = () => {
    if (!currentUser) return;
    
    const initialAmount = parseFloat(amount);
    if (isNaN(initialAmount) || initialAmount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
      return;
    }
    
    setIsLoading(true);
    try {
      openRegister(currentUser.id, initialAmount);
      setAmount('');
      Alert.alert('Success', 'Cash register opened successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to open register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRegister = () => {
    if (!cashRegister) return;
    
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
      return;
    }
    
    // Calculate expected amount
    const openingBalance = cashRegister.openingBalance;
    const cashTransactions = cashRegister.transactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.finalAmount, 0);
    const expectedAmount = openingBalance + cashTransactions;
    
    const difference = finalAmount - expectedAmount;
    
    // Ask for confirmation showing the difference
    Alert.alert(
      'Confirm Register Closing',
      `Opening Balance: $${openingBalance.toFixed(2)}
Cash Transactions: $${cashTransactions.toFixed(2)}
Expected Amount: $${expectedAmount.toFixed(2)}
Closing Amount: $${finalAmount.toFixed(2)}
Difference: $${difference.toFixed(2)} ${difference !== 0 ? (difference > 0 ? '(Excess)' : '(Shortage)') : ''}

Are you sure you want to close the register?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Close Register', 
          style: 'default',
          onPress: () => {
            setIsLoading(true);
            try {
              closeRegister(finalAmount);
              setAmount('');
              Alert.alert('Success', 'Cash register closed successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to close register');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // If no user, show loading
  if (!currentUser) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Cash Register</ThemedText>
        <ThemedText style={styles.subtitle}>
          {cashRegister ? 'Register is currently open' : 'Register is currently closed'}
        </ThemedText>

        {cashRegister ? (
          <ThemedView style={[styles.registerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText type="subtitle">Register Summary</ThemedText>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Opened By:</ThemedText>
              <ThemedText>{currentUser.name}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Opening Balance:</ThemedText>
              <ThemedText>${cashRegister.openingBalance.toFixed(2)}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Opened At:</ThemedText>
              <ThemedText>
                {new Date(cashRegister.openedAt).toLocaleString()}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Transactions:</ThemedText>
              <ThemedText>{cashRegister.transactions.length}</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.section, { marginTop: 24 }]}>
              <ThemedText type="subtitle">Close Register</ThemedText>
              <ThemedText style={styles.helperText}>
                Enter the final cash amount in the register
              </ThemedText>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                keyboardType="decimal-pad"
                placeholder="Final Cash Amount"
                placeholderTextColor={colors.placeholder}
                value={amount}
                onChangeText={setAmount}
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={handleCloseRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.buttonText} size="small" />
                ) : (
                  <ThemedText style={[styles.buttonText, { color: colors.buttonText }]}>
                    Close Register
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView style={[styles.registerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText type="subtitle">Open Register</ThemedText>
            <ThemedText style={styles.helperText}>
              Enter the starting cash amount in the register
            </ThemedText>

            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border
              }]}
              keyboardType="decimal-pad"
              placeholder="Starting Cash Amount"
              placeholderTextColor={colors.placeholder}
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleOpenRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.buttonText} size="small" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: colors.buttonText }]}>
                  Open Register
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  registerCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  label: {
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  helperText: {
    marginTop: 8,
    marginBottom: 16,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
