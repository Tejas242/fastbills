export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  unit: string; // e.g., kg, pcs, liter
  barcode?: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  overriddenPrice?: number; // For price overrides
}

export interface Bill {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  finalAmount: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'upi';
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  voidStatus?: 'active' | 'voided';
  voidReason?: string;
  voidedBy?: string;
  changeDue?: number; // For cash payments
  refundReference?: string; // For refunds
}

export interface User {
  id: string;
  name: string;
  role: 'cashier' | 'manager';
  password: string; // In a real app, this would be hashed
}

export interface CashRegister {
  openingBalance: number;
  closingBalance?: number;
  transactions: Bill[];
  openedAt: Date;
  closedAt?: Date;
  cashierId: string;
}

export type ReportTimeframe = 'daily' | 'weekly' | 'monthly';
