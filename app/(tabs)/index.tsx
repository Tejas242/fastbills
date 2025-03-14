import React, { useMemo, useState, useRef } from 'react';
import { StyleSheet, FlatList, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ProductCard } from '@/components/ui/ProductCard';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { BarcodeScanner } from '@/components/BarcodeScanner';

// List of product categories from our sample data
const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Grains', 'Beverages', 'Snacks'];

// Make sure to have a valid default export - this was identified as missing in the error
export default function ProductsScreen() {
  const { products, currentUser, lowStockItems } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [scannerVisible, setScannerVisible] = useState(false);
  const { colors, isDark } = useTheme();
  const listRef = useRef<FlatList>(null);
  
  const isManager = currentUser?.role === 'manager';

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filter by search query
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.barcode || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleBarcodeScan = (barcode: string) => {
    // Look for exact match by barcode first
    const exactMatch = products.find(p => p.barcode === barcode);
    if (exactMatch) {
      setSearchQuery(barcode);
      // Scroll to top after search is applied
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } else {
      Alert.alert(
        'No Product Found',
        `No product found with barcode: ${barcode}`,
        [
          { 
            text: 'Search Anyway', 
            onPress: () => setSearchQuery(barcode) 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title">Fast Bills</ThemedText>
          <ThemedText>Supermarket Billing System</ThemedText>
        </View>
        
        {isManager && lowStockItems.length > 0 && (
          <TouchableOpacity 
            style={[styles.inventoryButton, { backgroundColor: colors.warning }]}
            onPress={() => router.push('/inventory')}
          >
            <ThemedText style={styles.inventoryButtonText}>
              {lowStockItems.length} low stock
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputWrapper,
          { 
            backgroundColor: colors.inputBackground, 
            borderColor: colors.border,
            flex: 1
          }
        ]}>
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products or scan barcode..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <IconSymbol
                name="xmark"
                size={20}
                color={colors.placeholder}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
          onPress={() => setScannerVisible(true)}
        >
          <IconSymbol 
            name="barcode.viewfinder" 
            size={20} 
            color={colors.buttonText} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === item ? colors.primary : isDark ? '#333' : '#e0e0e0',
                  borderColor: isDark && selectedCategory !== item ? colors.border : 'transparent'
                }
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <ThemedText 
                style={[
                  styles.categoryText, 
                  selectedCategory === item && { color: '#fff' }
                ]}
              >
                {item}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <FlatList
        ref={listRef}
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ProductCard product={item} />}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">No products found</ThemedText>
            <ThemedText>Try adjusting your search or category filter</ThemedText>
          </ThemedView>
        )}
      />

      <BarcodeScanner
        isVisible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inventoryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearIcon: {
    padding: 4,
  },
  scanButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '500',
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
