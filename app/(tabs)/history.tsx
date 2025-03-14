import React from 'react';
import { StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BillCard } from '@/components/ui/BillCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';

export default function HistoryScreen() {
  const { bills, deleteBill, currentUser } = useStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const isManager = currentUser?.role === 'manager';

  const handleDeleteBill = (billId: string) => {
    if (!isManager) {
      Alert.alert('Access Denied', 'Only managers can delete bills');
      return;
    }
    
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBill(billId) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Billing History</ThemedText>
        
        <ThemedView style={styles.headerRight}>
          <ThemedText>{bills.length} {bills.length === 1 ? 'bill' : 'bills'}</ThemedText>
          
          {isManager && (
            <TouchableOpacity 
              style={[styles.reportButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/reports')}
            >
              <ThemedText style={{ color: colors.buttonText, fontSize: 12 }}>
                View Reports
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
      
      {bills.length > 0 ? (
        <FlatList
          data={bills}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <BillCard 
              bill={item} 
              onLongPress={() => handleDeleteBill(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <EmptyState
          title="No Billing History"
          message="Completed transactions will appear here"
          icon="clock.fill"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});
