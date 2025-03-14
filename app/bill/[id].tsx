import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Share, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/context/ThemeContext';
import { shareReceipt } from '@/utils/receipts';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bills, voidBill, currentUser, processRefund } = useStore();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const bill = bills.find(b => b.id === id);
  
  if (!bill) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Bill not found</ThemedText>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]} 
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: colors.buttonText }}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  const formattedDate = new Date(bill.date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = async () => {
    if (!bill) return;
    
    setIsSharing(true);
    try {
      // Create a formatted message for sharing
      const itemsList = bill.items.map(item => {
        const itemPrice = item.overriddenPrice || item.product.price;
        return `${item.product.name} (${item.quantity} x $${itemPrice.toFixed(2)}): $${(item.quantity * itemPrice).toFixed(2)}`;
      }).join('\n');
      
      const message = `
FAST BILLS RECEIPT
Bill #: ${bill.id.substring(0, 6)}
Date: ${formattedDate}
Cashier: ${bill.cashierName}
${bill.voidStatus === 'voided' ? 'STATUS: VOIDED BY ' + bill.voidedBy : ''}
${bill.customerName ? `Customer: ${bill.customerName}` : ''}
${bill.customerPhone ? `Phone: ${bill.customerPhone}` : ''}

Items:
${itemsList}

Subtotal: $${bill.total.toFixed(2)}
Tax (10%): $${bill.tax.toFixed(2)}
${bill.discount > 0 ? `Discount: $${bill.discount.toFixed(2)}` : ''}
TOTAL: $${bill.finalAmount.toFixed(2)}
${bill.changeDue ? `Paid: $${(bill.finalAmount + bill.changeDue).toFixed(2)}\nChange: $${bill.changeDue.toFixed(2)}` : ''}

Payment Method: ${bill.paymentMethod.toUpperCase()}
${bill.refundReference ? `Refund Reference: #${bill.refundReference.substring(0, 6)}` : ''}

Thank you for shopping with us!
`;
      
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing receipt:', error);
      Alert.alert('Error', 'Could not share receipt');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSharePDF = async () => {
    if (!bill) return;
    
    setIsPrinting(true);
    try {
      await shareReceipt(bill);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleVoidBill = () => {
    if (!currentUser || currentUser.role !== 'manager') {
      Alert.alert('Access Denied', 'Only managers can void bills');
      return;
    }

    Alert.alert(
      'Void Bill',
      'Please provide a reason for voiding this bill',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Void Bill',
          style: 'destructive',
          onPress: () => {
            try {
              voidBill(bill.id, 'Manager requested void');
              Alert.alert('Success', 'Bill has been voided');
            } catch (error) {
              Alert.alert('Error', 'Failed to void bill');
            }
          }
        }
      ]
    );
  };

  const handleRefund = () => {
    if (!bill || bill.voidStatus === 'voided') return;
    
    Alert.alert(
      'Process Refund',
      'Are you sure you want to refund this entire transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: () => {
            try {
              const refundBill = processRefund(bill.id);
              Alert.alert(
                'Refund Processed',
                `Refund completed successfully. Amount: $${Math.abs(refundBill.finalAmount).toFixed(2)}`,
                [
                  {
                    text: 'View Refund',
                    onPress: () => router.replace({
                      pathname: '/bill/[id]',
                      params: { id: refundBill.id }
                    })
                  },
                  { text: 'OK' }
                ]
              );
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process refund');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.receiptHeader}>
          <ThemedText type="title">Receipt</ThemedText>
          <View style={styles.headerActions}>
            {bill.voidStatus !== 'voided' && currentUser?.role === 'manager' && (
              <TouchableOpacity onPress={handleVoidBill} style={styles.actionButton}>
                <IconSymbol 
                  name="chevron.right" 
                  size={24} 
                  color={colors.error}
                />
                <ThemedText style={{ color: colors.error }}>Void</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleShare} style={styles.actionButton} disabled={isSharing}>
              {isSharing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <IconSymbol 
                    name="paperplane.fill" 
                    size={24} 
                    color={colors.primary}
                  />
                  <ThemedText style={{ color: colors.primary }}>Share</ThemedText>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSharePDF} style={styles.actionButton} disabled={isPrinting}>
              {isPrinting ? (
                <ActivityIndicator size="small" color={colors.info} />
              ) : (
                <>
                  <IconSymbol 
                    name="paperplane.fill" 
                    size={24} 
                    color={colors.info}
                  />
                  <ThemedText style={{ color: colors.info }}>PDF</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
        
        <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {bill.voidStatus === 'voided' && (
            <View style={[styles.voidOverlay, { backgroundColor: colors.error }]}>
              <ThemedText style={styles.voidText}>VOIDED</ThemedText>
            </View>
          )}
          
          <ThemedView style={styles.billHeader}>
            <ThemedText type="subtitle">Bill #{bill.id.substring(0, 6)}</ThemedText>
            <ThemedText>{formattedDate}</ThemedText>
          </ThemedView>
          
          <ThemedView style={[styles.infoBox, { backgroundColor: colors.inputBackground }]}>
            <ThemedText type="defaultSemiBold">Cashier: {bill.cashierName}</ThemedText>
            {bill.voidStatus === 'voided' && (
              <>
                <ThemedText style={{ color: colors.error }}>Voided by: {bill.voidedBy}</ThemedText>
                <ThemedText style={{ color: colors.error }}>Reason: {bill.voidReason}</ThemedText>
              </>
            )}
          </ThemedView>
          
          {bill.customerName && (
            <ThemedView style={[styles.customerInfo, { backgroundColor: colors.inputBackground }]}>
              <ThemedText type="defaultSemiBold">Customer: {bill.customerName}</ThemedText>
              {bill.customerPhone && <ThemedText>Phone: {bill.customerPhone}</ThemedText>}
            </ThemedView>
          )}
          
          <ThemedText type="defaultSemiBold" style={styles.itemsHeader}>Items</ThemedText>
          
          {bill.items.map((item, index) => {
            const itemPrice = item.overriddenPrice || item.product.price;
            return (
              <ThemedView key={index} style={styles.itemRow}>
                <View style={{ flex: 3 }}>
                  <ThemedText>{item.product.name}</ThemedText>
                  <ThemedText style={styles.smallText}>
                    {item.quantity} x ${itemPrice.toFixed(2)}
                    {item.overriddenPrice && ' (Price Override)'}
                  </ThemedText>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <ThemedText>${(item.quantity * itemPrice).toFixed(2)}</ThemedText>
                </View>
              </ThemedView>
            );
          })}
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Subtotal</ThemedText>
            <ThemedText>${bill.total.toFixed(2)}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Tax (10%)</ThemedText>
            <ThemedText>${bill.tax.toFixed(2)}</ThemedText>
          </ThemedView>
          
          {bill.discount > 0 && (
            <ThemedView style={styles.summaryRow}>
              <ThemedText>Discount</ThemedText>
              <ThemedText>-${bill.discount.toFixed(2)}</ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText type="defaultSemiBold">TOTAL</ThemedText>
            <ThemedText type="defaultSemiBold">${bill.finalAmount.toFixed(2)}</ThemedText>
          </ThemedView>
          
          {bill.changeDue !== undefined && (
            <>
              <ThemedView style={styles.summaryRow}>
                <ThemedText>Cash Received</ThemedText>
                <ThemedText>${(bill.finalAmount + bill.changeDue).toFixed(2)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.summaryRow}>
                <ThemedText>Change Due</ThemedText>
                <ThemedText>${bill.changeDue.toFixed(2)}</ThemedText>
              </ThemedView>
            </>
          )}
          
          <ThemedView style={[styles.paymentMethod, { backgroundColor: colors.inputBackground }]}>
            <ThemedText type="defaultSemiBold">Payment Method</ThemedText>
            <ThemedText style={{ textTransform: 'capitalize' }}>{bill.paymentMethod}</ThemedText>
          </ThemedView>
          
          {bill.refundReference && (
            <ThemedView style={[styles.refundInfo, { backgroundColor: colors.warning + '30' }]}>
              <ThemedText type="defaultSemiBold">Refund Transaction</ThemedText>
              <ThemedText>Original Bill: #{bill.refundReference.substring(0, 6)}</ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>Thank you for shopping with us!</ThemedText>
          </ThemedView>
        </ThemedView>
        
        {/* Add refund button at the bottom if not already voided or a refund itself */}
        {bill && !bill.refundReference && bill.voidStatus !== 'voided' && (
          <TouchableOpacity
            style={[styles.refundButton, { backgroundColor: colors.warning }]}
            onPress={handleRefund}
          >
            <ThemedText style={styles.refundButtonText}>Process Refund</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  voidOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voidText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  billHeader: {
    marginBottom: 16,
  },
  infoBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  customerInfo: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  itemsHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallText: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  paymentMethod: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  refundInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  refundButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refundButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
