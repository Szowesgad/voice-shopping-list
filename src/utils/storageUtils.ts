import type { ShoppingItem } from '../types';

/**
 * Save items to local storage
 * @param items Shopping items to save
 * @param key Local storage key
 * @returns True if save successful
 */
export const saveItemsToStorage = (
  items: ShoppingItem[],
  key: string = 'voice-shopping-list'
): boolean => {
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load items from local storage
 * @param key Local storage key
 * @returns Array of shopping items or empty array if none found
 */
export const loadItemsFromStorage = (
  key: string = 'voice-shopping-list'
): ShoppingItem[] => {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return [];
    
    const items = JSON.parse(serialized) as ShoppingItem[];
    
    // Validate the shape of the loaded data
    if (!Array.isArray(items)) return [];
    
    // Ensure all items have the correct shape
    return items.filter(item => 
      item && 
      typeof item === 'object' && 
      typeof item.id === 'string' && 
      typeof item.text === 'string' && 
      typeof item.completed === 'boolean' && 
      typeof item.createdAt === 'number'
    );
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

/**
 * Clear items from local storage
 * @param key Local storage key
 * @returns True if clear successful
 */
export const clearItemsFromStorage = (
  key: string = 'voice-shopping-list'
): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Check if local storage is available
 * @returns True if available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Calculate the size of data in local storage
 * @param key Local storage key
 * @returns Size in bytes
 */
export const getStorageSize = (
  key: string = 'voice-shopping-list'
): number => {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return 0;
    
    // Calculate size in bytes (each character is 2 bytes in UTF-16)
    return serialized.length * 2;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

/**
 * Check if adding items would exceed storage limits
 * @param newItems Items to add
 * @param key Local storage key
 * @returns True if it would exceed limits
 */
export const wouldExceedStorageLimits = (
  newItems: ShoppingItem[],
  key: string = 'voice-shopping-list'
): boolean => {
  try {
    // Most browsers have a limit of about 5MB per domain
    const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes
    
    // Get current size
    const currentSize = getStorageSize(key);
    
    // Calculate new items size
    const newItemsSize = JSON.stringify(newItems).length * 2;
    
    // Check if total would exceed limit
    return (currentSize + newItemsSize) > STORAGE_LIMIT;
  } catch (error) {
    console.error('Error checking storage limits:', error);
    return false;
  }
};
