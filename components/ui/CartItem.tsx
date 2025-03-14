import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CartItem as CartItemType } from '@/types';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart, overridePrice } = useStore();
  const { colors } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [newPrice, setNewPrice] = useState(
    item.overriddenPrice?.toString() || item.product.price.toString()
  );

  const handleIncrement = () => {
    try {
      updateCartItemQuantity(item.product.id, item.quantity + 1);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not update quantity');
    }
  };

  const handleDecrement = () => {
    if (item.quantity === 1) {
      removeFromCart(item.product.id);
    } else {
      updateCartItemQuantity(item.product.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${item.product.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.product.id) }
      ]
    );
  };

  const handlePriceOverride = () => {
    try {
      const priceValue = parseFloat(newPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price');
        return;
      }
      
      overridePrice(item.product.id, priceValue);
      setPriceEditMode(false);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Price override failed');
    }
  };

  const itemPrice = item.overriddenPrice || item.product.price;
  const totalPrice = itemPrice * item.quantity;
  const isOverridden = item.overriddenPrice !== undefined;

  return (
    <ThemedView style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.product.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <ThemedText type="defaultSemiBold">{item.product.name}</ThemedText>
          {isOverridden && (
            <ThemedText style={{ color: colors.warning, fontSize: 12 }}>
              (Price Override)
            </ThemedText>
          )}
        </View>
        
        <ThemedText style={styles.priceText}>
          ${itemPrice.toFixed(2)} / {item.product.unit}
        </ThemedText>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
            onPress={handleDecrement}
          >
            <ThemedText style={styles.quantityButtonText}>-</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
            onPress={handleIncrement}
          >
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <ThemedText type="defaultSemiBold">${totalPrice.toFixed(2)}</ThemedText>
        <TouchableOpacity 
          style={[styles.removeButton, { backgroundColor: colors.error }]} 
          onPress={handleRemove}
        >
          <ThemedText style={styles.removeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    opacity: 0.8,
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
