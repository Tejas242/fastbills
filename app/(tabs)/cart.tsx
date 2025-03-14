import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CartItem } from '@/components/ui/CartItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';

export default function CartScreen() {
  const { cart, getCartTotal, clearCart } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const totalAmount = getCartTotal();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to the cart before checkout.');
      return;
    }
    
    router.push('/checkout');
  };
  
  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearCart() }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Cart</ThemedText>
        {cart.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <ThemedText style={{ color: colors.error }}>Clear All</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      
      {cart.length > 0 ? (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.product.id}
            renderItem={({item}) => <CartItem item={item} />}
            contentContainerStyle={styles.listContainer}
          />
          
          <ThemedView style={[styles.footer, { borderTopColor: colors.border }]}>
            <ThemedView style={styles.totalContainer}>
              <ThemedText type="defaultSemiBold">Total:</ThemedText>
              <ThemedText type="title" style={styles.totalAmount}>${totalAmount.toFixed(2)}</ThemedText>
            </ThemedView>
            
            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              onPress={handleCheckout}
            >
              <ThemedText style={[styles.checkoutButtonText, { color: colors.buttonText }]}>
                Proceed to Checkout
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
      ) : (
        <EmptyState
          title="Your Cart is Empty"
          message="Add items from the products page to get started"
          icon="cart.fill"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    color: '#ff6b6b',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 24,
  },
  checkoutButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
