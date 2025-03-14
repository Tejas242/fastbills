import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { ReportTimeframe } from '@/types';

export default function ReportsScreen() {
  const { generateSalesReport, generateInventoryReport, currentUser } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('daily');
  const [showInventory, setShowInventory] = useState(false);
  
  const isManager = currentUser?.role === 'manager';

  // Redirect if not a manager
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'manager') {
      router.replace('/');
    } else if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser]);

  const reportData = useMemo(() => {
    if (showInventory) {
      return generateInventoryReport();
    } else {
      const salesReport = generateSalesReport(timeframe);
      
      // Calculate total sales
      const totalSales = salesReport.reduce((sum, bill) => sum + bill.finalAmount, 0);
      
      // Group by category for category breakdown
      const categorySales: Record<string, number> = {};
      salesReport.forEach(bill => {
        bill.items.forEach(item => {
          const category = item.product.category;
          const amount = (item.overriddenPrice || item.product.price) * item.quantity;
          categorySales[category] = (categorySales[category] || 0) + amount;
        });
      });
      
      // Group by payment method
      const paymentMethodSales: Record<string, number> = {};
      salesReport.forEach(bill => {
        const method = bill.paymentMethod;
        paymentMethodSales[method] = (paymentMethodSales[method] || 0) + bill.finalAmount;
      });
      
      return {
        bills: salesReport,
        totalSales,
        categorySales,
        paymentMethodSales
      };
    }
  }, [timeframe, showInventory, generateSalesReport, generateInventoryReport]);

  if (!isManager) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Reports</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            !showInventory && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setShowInventory(false)}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              !showInventory && { color: colors.primary, fontWeight: 'bold' }
            ]}
          >
            Sales
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            showInventory && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setShowInventory(true)}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              showInventory && { color: colors.primary, fontWeight: 'bold' }
            ]}
          >
            Inventory
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ScrollView contentContainerStyle={styles.content}>
        {!showInventory ? (
          <>
            <ThemedView style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  timeframe === 'daily' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTimeframe('daily')}
              >
                <ThemedText 
                  style={[
                    styles.periodButtonText, 
                    timeframe === 'daily' && { color: colors.buttonText }
                  ]}
                >
                  Daily
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  timeframe === 'weekly' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTimeframe('weekly')}
              >
                <ThemedText 
                  style={[
                    styles.periodButtonText, 
                    timeframe === 'weekly' && { color: colors.buttonText }
                  ]}
                >
                  Weekly
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  timeframe === 'monthly' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTimeframe('monthly')}
              >
                <ThemedText 
                  style={[
                    styles.periodButtonText, 
                    timeframe === 'monthly' && { color: colors.buttonText }
                  ]}
                >
                  Monthly
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText type="subtitle">Sales Summary</ThemedText>
              <ThemedText style={styles.reportPeriod}>
                {timeframe === 'daily' ? 'Today' : 
                 timeframe === 'weekly' ? 'This Week' : 'This Month'}
              </ThemedText>
              
              <ThemedView style={[styles.totalSales, { backgroundColor: colors.success + '20' }]}>
                <ThemedText style={styles.totalSalesLabel}>Total Sales</ThemedText>
                <ThemedText style={[styles.totalSalesAmount, { color: colors.success }]}>
                  ${reportData.totalSales.toFixed(2)}
                </ThemedText>
              </ThemedView>
              
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Sales by Category
              </ThemedText>
              
              {Object.entries(reportData.categorySales).map(([category, amount], index) => (
                <ThemedView key={category} style={styles.dataRow}>
                  <ThemedText>{category}</ThemedText>
                  <ThemedText>${amount.toFixed(2)}</ThemedText>
                </ThemedView>
              ))}
              
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Sales by Payment Method
              </ThemedText>
              
              {Object.entries(reportData.paymentMethodSales).map(([method, amount], index) => (
                <ThemedView key={method} style={styles.dataRow}>
                  <ThemedText style={{ textTransform: 'capitalize' }}>{method}</ThemedText>
                  <ThemedText>${amount.toFixed(2)}</ThemedText>
                </ThemedView>
              ))}
              
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Transaction Count
              </ThemedText>
              
              <ThemedView style={styles.dataRow}>
                <ThemedText>Total Transactions</ThemedText>
                <ThemedText>{reportData.bills.length}</ThemedText>
              </ThemedView>
            </ThemedView>
          </>
        ) : (
          <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText type="subtitle">Inventory Status</ThemedText>
            
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Low Stock Items ({reportData.filter(p => p.stockQuantity <= p.lowStockThreshold).length})
            </ThemedText>
            
            {reportData.filter(p => p.stockQuantity <= p.lowStockThreshold).map(product => (
              <ThemedView key={product.id} style={[styles.inventoryItem, { borderColor: colors.border }]}>
                <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
                <ThemedView style={styles.inventoryDetails}>
                  <ThemedText>Stock: </ThemedText>
                  <ThemedText style={{ color: colors.error }}>
                    {product.stockQuantity} / {product.lowStockThreshold} {product.unit}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
            
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Stock Overview
            </ThemedText>
            
            {reportData.slice(0, 10).map(product => (
              <ThemedView key={product.id} style={[styles.inventoryItem, { borderColor: colors.border }]}>
                <ThemedText>{product.name}</ThemedText>
                <ThemedView style={styles.inventoryDetails}>
                  <ThemedText>Stock: </ThemedText>
                  <ThemedText style={product.stockQuantity <= product.lowStockThreshold ? { color: colors.error } : undefined}>
                    {product.stockQuantity} {product.unit}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
            
            <TouchableOpacity
              style={[styles.fullInventoryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/inventory')}
            >
              <ThemedText style={{ color: colors.buttonText }}>
                View Full Inventory
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  tabText: {
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  periodButtonText: {
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  reportPeriod: {
    marginBottom: 16,
    opacity: 0.7,
  },
  totalSales: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  totalSalesLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalSalesAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 17,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  inventoryDetails: {
    flexDirection: 'row',
  },
  fullInventoryButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  }
});
