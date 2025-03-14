import AsyncStorage from '@react-native-async-storage/async-storage';

// Base function to save data with error handling
export async function saveData<T>(key: string, data: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
}

// Base function to load data with error handling
export async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data !== null) {
      return JSON.parse(data) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
}

// Clear all app data (useful for debugging or reset functionality)
export async function clearAllData(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
}

// Check if there's any stored data for a specific key
export async function hasData(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking for ${key} in storage:`, error);
    return false;
  }
}
