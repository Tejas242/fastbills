import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackupData {
  products: any[];
  bills: any[];
  users: any[];
  timestamp: number;
  version: string;
}

export async function createBackup(): Promise<string> {
  try {
    const products = await AsyncStorage.getItem('products');
    const bills = await AsyncStorage.getItem('bills');
    const users = await AsyncStorage.getItem('users');
    
    const backupData: BackupData = {
      products: products ? JSON.parse(products) : [],
      bills: bills ? JSON.parse(bills) : [],
      users: users ? JSON.parse(users) : [],
      timestamp: Date.now(),
      version: '1.0.0',
    };
    
    const backupString = JSON.stringify(backupData);
    const fileName = `fastbills_backup_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, backupString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return fileUri;
  } catch (error) {
    console.error('Backup failed', error);
    throw new Error('Failed to create backup');
  }
}

export async function shareBackup(): Promise<void> {
  try {
    const backupUri = await createBackup();
    
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing isn't available on this device");
    }
    
    await Sharing.shareAsync(backupUri, {
      mimeType: 'application/json',
      dialogTitle: 'Share FastBills Backup',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Share backup failed', error);
    throw error;
  }
}

export async function restoreBackup(): Promise<void> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      throw new Error('Document picking canceled');
    }
    
    const { uri } = result.assets[0];
    const backupContent = await FileSystem.readAsStringAsync(uri);
    const backupData: BackupData = JSON.parse(backupContent);
    
    // Validate backup structure
    if (!backupData.products || !backupData.bills || !backupData.version) {
      throw new Error('Invalid backup file format');
    }
    
    // Store the data
    await AsyncStorage.setItem('products', JSON.stringify(backupData.products));
    await AsyncStorage.setItem('bills', JSON.stringify(backupData.bills));
    
    // Don't overwrite users by default for security, unless needed
    // await AsyncStorage.setItem('users', JSON.stringify(backupData.users));
    
    return;
  } catch (error) {
    console.error('Restore backup failed', error);
    throw error;
  }
}
