import { User } from '@/types';

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'manager',
    role: 'manager',
    password: 'manager123'  // In a real app, this would be hashed
  },
  {
    id: '2',
    name: 'cashier',
    role: 'cashier',
    password: 'cashier123'  // In a real app, this would be hashed
  },
  {
    id: '3',
    name: 'cashier1',
    role: 'cashier',
    password: 'cashier123'  // In a real app, this would be hashed
  },
  {
    id: '3',
    name: 'cashier2',
    role: 'cashier',
    password: 'cashier456'  // In a real app, this would be hashed
  }
];
