import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import { Product, CartItem, Bill, User, CashRegister, ReportTimeframe } from '@/types';
import { sampleProducts } from '@/data/products';
import { sampleUsers } from '@/data/users';
import { saveData, loadData } from '@/utils/storage';

interface StoreContextType {
  // Products
  products: Product[];
  cart: CartItem[];
  bills: Bill[];
  users: User[];
  currentUser: User | null;
  cashRegister: CashRegister | null;
  lowStockItems: Product[];
  
  // Cart operations
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  overridePrice: (productId: string, newPrice: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // Bill operations
  generateBill: (
    customerName?: string, 
    customerPhone?: string, 
    paymentMethod?: 'cash' | 'card' | 'upi', 
    discount?: number,
    cashAmount?: number
  ) => Bill;
  voidBill: (billId: string, reason: string) => void;
  deleteBill: (billId: string) => void;
  processRefund: (originalBillId: string, items?: CartItem[]) => Bill;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, newQuantity: number) => void;
  
  // User operations
  login: (username: string, password: string) => User | null;
  logout: () => void;
  
  // Register operations
  openRegister: (userId: string, initialAmount: number) => void;
  closeRegister: (finalAmount: number) => void;
  
  // Reporting
  generateSalesReport: (timeframe: ReportTimeframe, categoryFilter?: string) => any;
  generateInventoryReport: () => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Computed property for low stock items
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Load all data in parallel for better performance
        const [
          savedProducts, 
          savedBills, 
          savedCart, 
          savedUsers,
          savedCurrentUser, 
          savedCashRegister
        ] = await Promise.all([
          loadData<Product[]>('products', sampleProducts),
          loadData<Bill[]>('bills', []),
          loadData<CartItem[]>('cart', []),
          loadData<User[]>('users', sampleUsers),
          loadData<User | null>('currentUser', null),
          loadData<CashRegister | null>('cashRegister', null)
        ]);

        // Update state with loaded data
        if (savedProducts && savedProducts.length > 0) {
          setProducts(savedProducts);
        }
        
        if (savedUsers && savedUsers.length > 0) {
          setUsers(savedUsers);
        }

        setBills(savedBills);
        setCart(savedCart);
        setCurrentUser(savedCurrentUser);
        setCashRegister(savedCashRegister);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading data from storage:', error);
        setIsInitialized(true); // Still mark as initialized to prevent app from hanging
      }
    };

    loadAppData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (!isInitialized) return; // Skip saving during initial load
    saveData('products', products);
  }, [products, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveData('cart', cart);
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveData('bills', bills);
  }, [bills, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveData('users', users);
  }, [users, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (currentUser) {
      saveData('currentUser', currentUser);
    } else {
      AsyncStorage.removeItem('currentUser').catch(err => 
        console.error('Error removing currentUser:', err)
      );
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (cashRegister) {
      saveData('cashRegister', cashRegister);
    } else {
      AsyncStorage.removeItem('cashRegister').catch(err => 
        console.error('Error removing cashRegister:', err)
      );
    }
  }, [cashRegister, isInitialized]);

  // Cart operations
  const addToCart = (product: Product, quantity: number) => {
    if (product.stockQuantity < quantity) {
      throw new Error(`Only ${product.stockQuantity} units available in stock`);
    }
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedCart = [...prevCart];
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
        
        // Check stock availability
        if (product.stockQuantity < newQuantity) {
          throw new Error(`Only ${product.stockQuantity} units available in stock`);
        }
        
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity
        };
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const productItem = prevCart.find(item => item.product.id === productId);
      if (productItem && productItem.product.stockQuantity < quantity) {
        throw new Error(`Only ${productItem.product.stockQuantity} units available in stock`);
      }
      
      return prevCart.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };
  
  const overridePrice = (productId: string, newPrice: number) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can override prices');
    }
    
    setCart(prevCart => {
      return prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, overriddenPrice: newPrice } 
          : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.overriddenPrice || item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Bill operations
  const generateBill = (
    customerName?: string, 
    customerPhone?: string, 
    paymentMethod: 'cash' | 'card' | 'upi' = 'cash',
    discount: number = 0,
    cashAmount?: number
  ): Bill => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }
    
    const subtotal = getCartTotal();
    const tax = subtotal * 0.1; // 10% tax
    const finalAmount = subtotal + tax - discount;
    
    let changeDue;
    if (paymentMethod === 'cash' && cashAmount) {
      if (cashAmount < finalAmount) {
        throw new Error('Insufficient cash amount');
      }
      changeDue = cashAmount - finalAmount;
    }
    
    const newBill: Bill = {
      id: nanoid(),
      items: [...cart],
      total: subtotal,
      tax,
      discount,
      finalAmount,
      date: new Date(),
      paymentMethod,
      customerName,
      customerPhone,
      cashierName: currentUser.name,
      voidStatus: 'active',
      changeDue,
    };
    
    setBills(prevBills => [newBill, ...prevBills]);
    
    // Update inventory
    cart.forEach(item => {
      updateStock(item.product.id, item.product.stockQuantity - item.quantity);
    });
    
    // Update cashRegister
    if (cashRegister) {
      setCashRegister({
        ...cashRegister,
        transactions: [...cashRegister.transactions, newBill]
      });
    }
    
    clearCart();
    return newBill;
  };
  
  const voidBill = (billId: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can void bills');
    }
    
    setBills(prevBills => {
      return prevBills.map(bill => {
        if (bill.id === billId && bill.voidStatus !== 'voided') {
          // Return inventory for voided items
          bill.items.forEach(item => {
            const product = products.find(p => p.id === item.product.id);
            if (product) {
              updateStock(item.product.id, product.stockQuantity + item.quantity);
            }
          });
          
          return {
            ...bill,
            voidStatus: 'voided',
            voidReason: reason,
            voidedBy: currentUser.name
          };
        }
        return bill;
      });
    });
  };

  const deleteBill = (billId: string) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can delete bills');
    }
    
    setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
  };
  
  const processRefund = (originalBillId: string, refundItems?: CartItem[]): Bill => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const originalBill = bills.find(b => b.id === originalBillId);
    if (!originalBill) {
      throw new Error('Original bill not found');
    }
    
    if (originalBill.voidStatus === 'voided') {
      throw new Error('Cannot refund a voided bill');
    }
    
    const itemsToRefund = refundItems || originalBill.items;
    const refundSubtotal = itemsToRefund.reduce((total, item) => {
      const itemPrice = item.overriddenPrice || item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    
    const refundTax = refundSubtotal * 0.1;
    const refundTotal = refundSubtotal + refundTax;
    
    const refundBill: Bill = {
      id: nanoid(),
      items: itemsToRefund,
      total: -refundSubtotal, // Negative amounts for refunds
      tax: -refundTax,
      discount: 0,
      finalAmount: -refundTotal,
      date: new Date(),
      paymentMethod: originalBill.paymentMethod,
      customerName: originalBill.customerName,
      customerPhone: originalBill.customerPhone,
      cashierName: currentUser.name,
      voidStatus: 'active',
      refundReference: originalBillId
    };
    
    setBills(prevBills => [refundBill, ...prevBills]);
    
    // Update inventory - add back refunded items
    itemsToRefund.forEach(item => {
      const product = products.find(p => p.id === item.product.id);
      if (product) {
        updateStock(item.product.id, product.stockQuantity + item.quantity);
      }
    });
    
    // Update cashRegister if open
    if (cashRegister) {
      setCashRegister({
        ...cashRegister,
        transactions: [...cashRegister.transactions, refundBill]
      });
    }
    
    return refundBill;
  };

  // Product operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can add products');
    }
    
    setProducts(prevProducts => [...prevProducts, { ...product, id: nanoid() }]);
  };
  
  const updateProduct = (product: Product) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can update products');
    }
    
    setProducts(prevProducts => {
      return prevProducts.map(p => p.id === product.id ? product : p);
    });
  };
  
  const deleteProduct = (productId: string) => {
    if (!currentUser || currentUser.role !== 'manager') {
      throw new Error('Only managers can delete products');
    }
    
    // Check if product is in any bills
    const isInBills = bills.some(bill => 
      bill.items.some(item => item.product.id === productId)
    );
    
    if (isInBills) {
      throw new Error('Cannot delete product that has been sold. Archive it instead.');
    }
    
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  const updateStock = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        if (product.id === productId) {
          return { ...product, stockQuantity: newQuantity };
        }
        return product;
      });
    });
  };

  // User operations
  const login = (username: string, password: string): User | null => {
    const user = users.find(u => u.name === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };
  
  const logout = () => {
    setCurrentUser(null);
  };

  // Register operations
  const openRegister = (userId: string, initialAmount: number) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    setCashRegister({
      openingBalance: initialAmount,
      transactions: [],
      openedAt: new Date(),
      cashierId: userId
    });
  };
  
  const closeRegister = (finalAmount: number) => {
    if (!cashRegister) {
      throw new Error('No register is open');
    }
    
    setCashRegister({
      ...cashRegister,
      closingBalance: finalAmount,
      closedAt: new Date()
    });
    
    // This would typically trigger a final report before clearing
    // For now, we just set it to null to indicate it's closed
    setTimeout(() => setCashRegister(null), 5000);
  };

  // Reporting
  const generateSalesReport = (timeframe: ReportTimeframe, categoryFilter?: string) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= startDate && bill.voidStatus !== 'voided';
    });
    
    if (categoryFilter) {
      // Further filter by category if provided
      return filteredBills.map(bill => ({
        ...bill,
        items: bill.items.filter(item => item.product.category === categoryFilter)
      })).filter(bill => bill.items.length > 0);
    }
    
    return filteredBills;
  };
  
  const generateInventoryReport = () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    return [...products].sort((a, b) => a.stockQuantity - b.stockQuantity);
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      bills,
      users,
      currentUser,
      cashRegister,
      lowStockItems,
      
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      overridePrice,
      clearCart,
      getCartTotal,
      
      generateBill,
      voidBill,
      deleteBill,
      processRefund,
      
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      
      login,
      logout,
      
      openRegister,
      closeRegister,
      
      generateSalesReport,
      generateInventoryReport
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
