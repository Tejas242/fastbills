import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { shareBackup, restoreBackup } from '@/utils/backup';
import { clearAllData } from '@/utils/storage';

export default function SettingsScreen() {
  const { currentUser, logout, cashRegister } = useStore();
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            logout();
            router.replace('/login');
          } 
        }
      ]
    );
  };

  const handleBackup = async () => {
    try {
      await shareBackup();
      Alert.alert('Success', 'Backup created and ready to share');
    } catch (error) {
      Alert.alert('Error', 'Failed to create or share backup');
    }
  };

  const handleRestore = async () => {
    if (!currentUser || currentUser.role !== 'manager') {
      Alert.alert('Access Denied', 'Only managers can restore data');
      return;
    }

    Alert.alert(
      'Restore Data',
      'This will replace your current data with the backup. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restoreBackup();
              Alert.alert('Success', 'Data restored successfully. Please restart the app.', [
                { text: 'OK', onPress: () => logout() } // Logout to refresh data
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup');
            }
          }
        }
      ]
    );
  };

  const handleResetApp = async () => {
    if (!currentUser || currentUser.role !== 'manager') {
      Alert.alert('Access Denied', 'Only managers can reset the app data');
      return;
    }

    Alert.alert(
      'Reset App Data',
      'WARNING: This will delete all app data including products, bills, and users. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              await clearAllData();
              
              // Log out the user to restart the app state
              logout();
              
              // Navigate back to login
              router.replace('/login');
              
              Alert.alert('Success', 'App data has been reset. Please log in again.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data');
            }
          }
        }
      ]
    );
  };

  if (!currentUser) {
    return null;
  }

  const isManager = currentUser.role === 'manager';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedView style={styles.userInfo}>
            <ThemedView style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {currentUser.name.charAt(0).toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.userDetails}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>{currentUser.name}</ThemedText>
              <ThemedText style={[styles.userRole, { color: colors.primary }]}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>

        <ThemedView style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <ThemedView style={styles.menuItemContent}>
              <IconSymbol 
                name="arrow.right" 
                size={20} 
                color={colors.error} 
                style={styles.menuIcon}
              />
              <ThemedText style={{ color: colors.error }}>Logout</ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Operations</ThemedText>

        <ThemedView style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/register')}
          >
            <ThemedView style={styles.menuItemContent}>
              <IconSymbol 
                name="doc.text" 
                size={20} 
                color={colors.primary} 
                style={styles.menuIcon}
              />
              <ThemedText>{cashRegister ? 'Manage Cash Register' : 'Open Cash Register'}</ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/inventory')}
          >
            <ThemedView style={styles.menuItemContent}>
              <IconSymbol 
                name="bag" 
                size={20} 
                color={colors.primary} 
                style={styles.menuIcon}
              />
              <ThemedText>Inventory Management</ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>

          {isManager && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/reports')}
            >
              <ThemedView style={styles.menuItemContent}>
                <IconSymbol 
                  name="doc.text.fill" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.menuIcon}
                />
                <ThemedText>Reports & Analytics</ThemedText>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={colors.border} />
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Data Management</ThemedText>

        <ThemedView style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleBackup}
          >
            <ThemedView style={styles.menuItemContent}>
              <IconSymbol
                name="arrow.right"
                size={20}
                color={colors.info}
                style={styles.menuIcon}
              />
              <ThemedText>Backup Data</ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={colors.border} />
          </TouchableOpacity>
          
          {isManager && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleRestore}
              >
                <ThemedView style={styles.menuItemContent}>
                  <IconSymbol
                    name="arrow.left"
                    size={20}
                    color={isManager ? colors.warning : colors.disabled}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={{ color: isManager ? colors.text : colors.disabled }}>
                    Restore from Backup
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={colors.border} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleResetApp}
              >
                <ThemedView style={styles.menuItemContent}>
                  <IconSymbol
                    name="trash.fill"
                    size={20}
                    color={colors.error}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={{ color: colors.error }}>
                    Reset App Data
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={colors.border} />
              </TouchableOpacity>
            </>
          )}
        </ThemedView>

        <ThemedText style={styles.appVersion}>FastBills v1.0.0</ThemedText>
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
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
  },
  userRole: {
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  appVersion: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6,
  }
});
