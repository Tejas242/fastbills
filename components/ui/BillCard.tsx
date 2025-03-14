import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Bill } from '@/types';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/context/ThemeContext';

interface BillCardProps {
  bill: Bill;
  onLongPress?: () => void;
}

export function BillCard({ bill, onLongPress }: BillCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  
  const handlePress = () => {
    router.push({
      pathname: '/bill/[id]',
      params: { id: bill.id }
    });
  };

  const formattedDate = new Date(bill.date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isRefund = bill.finalAmount < 0;
  const isVoided = bill.voidStatus === 'voided';

  return (
    <TouchableOpacity onPress={handlePress} onLongPress={onLongPress} delayLongPress={500}>
      <ThemedView style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: isRefund 
            ? colors.warning 
            : isVoided 
              ? colors.error 
              : colors.primary
        }
      ]}>
        <View style={styles.statusBadgeContainer}>
          {isVoided && (
            <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
              <ThemedText style={styles.statusText}>VOIDED</ThemedText>
            </View>
          )}
          
          {isRefund && (
            <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
              <ThemedText style={styles.statusText}>REFUND</ThemedText>
            </View>
          )}
        </View>
        
        <ThemedView style={styles.header}>
          <ThemedText type="defaultSemiBold">Bill #{bill.id.substring(0, 6)}</ThemedText>
          <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.details}>
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Items:</ThemedText>
            <ThemedText>{bill.items.length}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Cashier:</ThemedText>
            <ThemedText>{bill.cashierName}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Payment:</ThemedText>
            <ThemedText style={styles.capitalizedText}>{bill.paymentMethod}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel} type="defaultSemiBold">Total:</ThemedText>
            <ThemedText type="defaultSemiBold" style={isRefund ? { color: colors.warning } : undefined}>
              {isRefund ? '-' : ''}${Math.abs(bill.finalAmount).toFixed(2)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <View style={styles.chevronContainer}>
          <IconSymbol
            name="chevron.right"
            size={20}
            color={colors.border}
          />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderLeftWidth: 5,
    position: 'relative',
    minHeight: 140,
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 11,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 20,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.8,
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 24,
  },
  detailLabel: {
    opacity: 0.7,
  },
  capitalizedText: {
    textTransform: 'capitalize',
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  }
});
