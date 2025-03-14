import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';

type PaymentMethod = 'cash' | 'card' | 'upi';

export default function CheckoutScreen() {
  const { cart, getCartTotal, generateBill } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subtotal = getCartTotal();
  const discountValue = parseFloat(discount) || 0;
  const tax = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + tax - discountValue;

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    
    if (paymentMethod === 'cash') {
      const cashValue = parseFloat(cashAmount);
      if (isNaN(cashValue) || cashValue < totalAmount) {
        Alert.alert('Invalid Cash Amount', `Please enter a valid amount equal to or greater than $${totalAmount.toFixed(2)}`);
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      const bill = generateBill(
        customerName || undefined,
        customerPhone || undefined,
        paymentMethod,
        discountValue,
        paymentMethod === 'cash' ? parseFloat(cashAmount) : undefined
      );
      
      // Navigate to the bill details page
      router.replace({
        pathname: '/bill/[id]',
        params: { id: bill.id }
      });
      
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate bill');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Checkout</ThemedText>
          <ThemedText>{cart.length} {cart.length === 1 ? 'item' : 'items'}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Customer Details</ThemedText>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Customer Name (optional)"
            placeholderTextColor={colors.placeholder}
            value={customerName}
            onChangeText={setCustomerName}
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
            placeholder="Phone Number (optional)"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            value={customerPhone}
            onChangeText={setCustomerPhone}
          />
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Payment Method</ThemedText>
          
          <ThemedView style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                { borderColor: colors.border },
                paymentMethod === 'cash' && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <ThemedText 
                style={[
                  styles.paymentOptionText, 
                  paymentMethod === 'cash' && { color: colors.buttonText }
                ]}
              >
                Cash
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                { borderColor: colors.border },
                paymentMethod === 'card' && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <ThemedText 
                style={[
                  styles.paymentOptionText, 
                  paymentMethod === 'card' && { color: colors.buttonText }
                ]}
              >
                Card
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                { borderColor: colors.border },
                paymentMethod === 'upi' && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => setPaymentMethod('upi')}
            >
              <ThemedText 
                style={[
                  styles.paymentOptionText, 
                  paymentMethod === 'upi' && { color: colors.buttonText }
                ]}
              >
                UPI
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          {paymentMethod === 'cash' && (
            <View style={{ marginTop: 16 }}>
              <ThemedText style={styles.inputLabel}>Cash Amount Received</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder={`Enter amount (min. $${totalAmount.toFixed(2)})`}
                placeholderTextColor={colors.placeholder}
                keyboardType="decimal-pad"
                value={cashAmount}
                onChangeText={setCashAmount}
              />
              
              {parseFloat(cashAmount) >= totalAmount && (
                <ThemedView style={styles.changeContainer}>
                  <ThemedText>Change to return:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ color: colors.success }}>
                    ${(parseFloat(cashAmount) - totalAmount).toFixed(2)}
                  </ThemedText>
                </ThemedView>
              )}
            </View>
          )}
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Discount</ThemedText>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Enter discount amount"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
          />
        </ThemedView>
        
        <ThemedView style={[styles.summary, { backgroundColor: colors.card }]}>
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Subtotal</ThemedText>
            <ThemedText>${subtotal.toFixed(2)}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Tax (10%)</ThemedText>
            <ThemedText>${tax.toFixed(2)}</ThemedText>
          </ThemedView>
          
          {discountValue > 0 && (
            <ThemedView style={styles.summaryRow}>
              <ThemedText>Discount</ThemedText>
              <ThemedText>-${discountValue.toFixed(2)}</ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText type="defaultSemiBold">Total Amount</ThemedText>
            <ThemedText type="title" style={styles.totalAmount}>
              ${totalAmount.toFixed(2)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.buttonText} />
          ) : (
            <ThemedText style={[styles.checkoutButtonText, { color: colors.buttonText }]}>
              Complete Purchase
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  paymentOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentOptionText: {
    fontWeight: '600',
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  summary: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalAmount: {
    fontSize: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
