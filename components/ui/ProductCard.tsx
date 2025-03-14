import React, { useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/context/ThemeContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const { colors, isDark } = useTheme();
  
  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const outOfStock = product.stockQuantity === 0;

  const handleAddToCart = () => {
    if (outOfStock) {
      Alert.alert('Out of Stock', 'This product is currently unavailable');
      return;
    }
    
    if (quantity > product.stockQuantity) {
      Alert.alert('Limited Stock', `Only ${product.stockQuantity} units available`);
      return;
    }
    
    setIsLoading(true);
    try {
      addToCart(product, quantity);
      setTimeout(() => {
        setIsLoading(false);
        setQuantity(1);
      }, 500);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not add to cart');
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(prevQty => prevQty + 1);
    } else {
      Alert.alert('Limited Stock', `Only ${product.stockQuantity} units available`);
    }
  };
  
  const decrementQuantity = () => setQuantity(prevQty => (prevQty > 1 ? prevQty - 1 : 1));

  return (
    <ThemedView style={[
      styles.card, 
      { backgroundColor: colors.card, borderColor: colors.border }
    ]}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image} 
          resizeMode="cover"
          onError={(e) => console.log("Error loading image:", e.nativeEvent.error)}
        />
        {isLowStock && (
          <View style={[styles.badge, { backgroundColor: outOfStock ? colors.error : colors.warning }]}>
            <ThemedText style={styles.badgeText}>
              {outOfStock ? 'Out of Stock' : 'Low Stock'}
            </ThemedText>
          </View>
        )}
        {product.barcode && (
          <View style={[styles.barcodeContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)' }]}>
            <ThemedText style={styles.barcodeText}>{product.barcode}</ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {product.name}
        </ThemedText>
        <ThemedText style={styles.price}>
          ${product.price.toFixed(2)} / {product.unit}
        </ThemedText>
        <ThemedText style={styles.stockInfo}>
          In Stock: {product.stockQuantity} {product.unit}
        </ThemedText>
      </View>
      
      <View style={styles.actionContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
            onPress={decrementQuantity}
          >
            <ThemedText style={styles.quantityButtonText}>-</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.quantity}>{quantity}</ThemedText>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
            onPress={incrementQuantity}
          >
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[
            styles.addButton, 
            { 
              backgroundColor: outOfStock ? colors.disabled : colors.primary,
              opacity: outOfStock ? 0.6 : 1
            }
          ]}
          onPress={handleAddToCart}
          disabled={isLoading || outOfStock}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.buttonText} size="small" />
          ) : (
            <ThemedText style={[styles.addButtonText, { color: colors.buttonText }]}>
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  barcodeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  barcodeText: {
    fontSize: 10,
    opacity: 0.8,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    opacity: 0.8,
  },
  stockInfo: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  actionContainer: {
    padding: 12,
    paddingTop: 0,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontWeight: '600',
  }
});
