import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, View, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { Product } from '@/types';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Available product categories
const productCategories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Grains', 'Beverages', 'Snacks'];
// Available units for products
const productUnits = ['kg', 'pcs', 'liter', 'dozen', 'gram', 'box'];

export default function InventoryScreen() {
  const { products, updateStock, currentUser, addProduct } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState<{productId: string, value: string} | null>(null);
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: productCategories[0],
    unit: productUnits[0],
    barcode: '',
    stockQuantity: '',
    lowStockThreshold: '',
    image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=500&q=80', // Default image
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by low stock first
        if (a.stockQuantity <= a.lowStockThreshold && b.stockQuantity > b.lowStockThreshold) {
          return -1;
        } 
        if (a.stockQuantity > a.lowStockThreshold && b.stockQuantity <= b.lowStockThreshold) {
          return 1;
        }
        // Then by category
        return a.category.localeCompare(b.category);
      });
  }, [products, searchQuery]);

  const isManager = currentUser?.role === 'manager';

  const handleUpdateStock = (product: Product, newValue: string) => {
    const newStock = parseInt(newValue);
    if (isNaN(newStock) || newStock < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number');
      return;
    }
    
    try {
      updateStock(product.id, newStock);
      setEditMode(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not update stock');
    }
  };

  const handleAddProduct = () => {
    // Validate inputs
    if (!newProduct.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }

    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const stock = parseInt(newProduct.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    const threshold = parseInt(newProduct.lowStockThreshold);
    if (isNaN(threshold) || threshold < 0) {
      Alert.alert('Error', 'Please enter a valid low stock threshold');
      return;
    }

    try {
      // Create product object
      const product: Omit<Product, 'id'> = {
        name: newProduct.name.trim(),
        price: price,
        category: newProduct.category,
        unit: newProduct.unit,
        stockQuantity: stock,
        lowStockThreshold: threshold,
        image: newProduct.image,
      };

      // Add barcode if provided
      if (newProduct.barcode.trim()) {
        product.barcode = newProduct.barcode.trim();
      }

      addProduct(product);
      
      // Reset form and close modal
      setNewProduct({
        name: '',
        price: '',
        category: productCategories[0],
        unit: productUnits[0],
        barcode: '',
        stockQuantity: '',
        lowStockThreshold: '',
        image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=500&q=80',
      });
      setNewProductModal(false);
      
      Alert.alert('Success', 'Product added successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add product');
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isLowStock = item.stockQuantity <= item.lowStockThreshold;
    const isEditing = editMode?.productId === item.id;
    
    return (
      <ThemedView 
        style={[
          styles.productItem, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftColor: isLowStock ? colors.error : colors.border
          }
        ]}
      >
        <View style={styles.productInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          {item.barcode && (
            <ThemedText style={styles.barcodeText}>Barcode: {item.barcode}</ThemedText>
          )}
        </View>
        
        <View style={styles.stockContainer}>
          <ThemedText style={styles.priceText}>${item.price.toFixed(2)}/{item.unit}</ThemedText>
          
          <ThemedText style={styles.stockLabel}>Stock:</ThemedText>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.stockInput, { 
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                keyboardType="numeric"
                value={editMode.value}
                onChangeText={(text) => setEditMode({ productId: item.id, value: text })}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => handleUpdateStock(item, editMode.value)}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stockDisplay}>
              <ThemedText 
                style={[
                  styles.stockText, 
                  isLowStock && { color: colors.error }
                ]}
              >
                {item.stockQuantity} {item.unit}
                {isLowStock && ' (Low Stock)'}
              </ThemedText>
              
              {isManager && (
                <TouchableOpacity 
                  onPress={() => setEditMode({ productId: item.id, value: item.stockQuantity.toString() })}
                  style={[styles.editButton, { backgroundColor: colors.primary }]}
                >
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ThemedView>
    );
  };

  // Render category selection modal
  const renderCategoryPicker = () => (
    <Modal
      visible={showCategoryPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowCategoryPicker(false)}
      >
        <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.pickerTitle}>Select Category</ThemedText>
          <ScrollView>
            {productCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.pickerItem,
                  newProduct.category === category && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => {
                  setNewProduct(prev => ({ ...prev, category }));
                  setShowCategoryPicker(false);
                }}
              >
                <ThemedText 
                  style={[
                    styles.pickerItemText,
                    newProduct.category === category && { color: colors.primary, fontWeight: 'bold' }
                  ]}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render unit selection modal
  const renderUnitPicker = () => (
    <Modal
      visible={showUnitPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowUnitPicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowUnitPicker(false)}
      >
        <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={styles.pickerTitle}>Select Unit</ThemedText>
          <ScrollView>
            {productUnits.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.pickerItem,
                  newProduct.unit === unit && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => {
                  setNewProduct(prev => ({ ...prev, unit }));
                  setShowUnitPicker(false);
                }}
              >
                <ThemedText 
                  style={[
                    styles.pickerItemText,
                    newProduct.unit === unit && { color: colors.primary, fontWeight: 'bold' }
                  ]}
                >
                  {unit}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render the add product modal
  const renderAddProductModal = () => (
    <Modal
      visible={newProductModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setNewProductModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <ThemedText type="title" style={styles.modalTitle}>Add New Product</ThemedText>
          
          <ScrollView style={styles.modalScroll}>
            <ThemedText style={styles.fieldLabel}>Product Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter product name"
              placeholderTextColor={colors.placeholder}
              value={newProduct.name}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
            />
            
            <ThemedText style={styles.fieldLabel}>Price *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter price"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
            />
            
            <ThemedText style={styles.fieldLabel}>Category *</ThemedText>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.inputBackground }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <ThemedText>{newProduct.category}</ThemedText>
              <IconSymbol name="chevron.right" size={18} color={colors.text} />
            </TouchableOpacity>
            
            <ThemedText style={styles.fieldLabel}>Unit *</ThemedText>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.inputBackground }]}
              onPress={() => setShowUnitPicker(true)}
            >
              <ThemedText>{newProduct.unit}</ThemedText>
              <IconSymbol name="chevron.right" size={18} color={colors.text} />
            </TouchableOpacity>
            
            <ThemedText style={styles.fieldLabel}>Barcode (optional)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter barcode"
              placeholderTextColor={colors.placeholder}
              value={newProduct.barcode}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, barcode: text }))}
            />
            
            <ThemedText style={styles.fieldLabel}>Stock Quantity *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter initial stock"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={newProduct.stockQuantity}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, stockQuantity: text }))}
            />
            
            <ThemedText style={styles.fieldLabel}>Low Stock Threshold *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter threshold"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={newProduct.lowStockThreshold}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, lowStockThreshold: text }))}
            />
            
            <ThemedText style={styles.fieldLabel}>Image URL (optional)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter image URL"
              placeholderTextColor={colors.placeholder}
              value={newProduct.image}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, image: text }))}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setNewProductModal(false)}
            >
              <ThemedText style={{ fontWeight: '500' }}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddProduct}
            >
              <ThemedText style={{ color: colors.buttonText, fontWeight: '500' }}>Add Product</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      {renderCategoryPicker()}
      {renderUnitPicker()}
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Inventory Management</ThemedText>
        <ThemedText>{products.length} products</ThemedText>
      </ThemedView>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { 
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.border,
              flex: 1
            }
          ]}
          placeholder="Search products..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {isManager && (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setNewProductModal(true)}
          >
            <IconSymbol name="plus" size={24} color={colors.buttonText} />
          </TouchableOpacity>
        )}
      </View>
      
      {!isManager && (
        <ThemedView style={[styles.noticeBox, { backgroundColor: colors.warning + '30' }]}>
          <ThemedText>You are logged in as a cashier. Only managers can update inventory.</ThemedText>
        </ThemedView>
      )}
      
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">No products found</ThemedText>
            <ThemedText>Try adjusting your search</ThemedText>
          </ThemedView>
        )}
      />

      {renderAddProductModal()}
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
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  noticeBox: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  productItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  barcodeText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  stockDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontWeight: '500',
    marginRight: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stockInput: {
    width: 60,
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: 'center',
    marginRight: 6,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  fieldLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickerContainer: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  pickerTitle: {
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerItemText: {
    fontSize: 16,
  },
});
