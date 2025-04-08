/**
 * Enhanced localStorage utility with expiration, versioning and fallbacks.
 * Provides a reliable way to store and retrieve data from localStorage
 * with proper error handling and type safety.
 */

// Item stored in localStorage with metadata
interface StorageItem<T> {
  value: T;
  version: string;
  timestamp: number;
  expiry?: number; // expiry time in milliseconds from timestamp
}

class StorageService {
  private appPrefix: string;
  private appVersion: string;

  constructor(appPrefix = 'mini-chatgpt-bot', appVersion = '1.0.0') {
    this.appPrefix = appPrefix;
    this.appVersion = appVersion;
  }

  /**
   * Get the prefixed key
   */
  private getKey(key: string): string {
    return `${this.appPrefix}:${key}`;
  }

  /**
   * Store a value with optional expiration
   */
  set<T>(key: string, value: T, options: { expiry?: number } = {}): boolean {
    try {
      const storageItem: StorageItem<T> = {
        value,
        version: this.appVersion,
        timestamp: Date.now(),
        expiry: options.expiry
      };
      
      localStorage.setItem(this.getKey(key), JSON.stringify(storageItem));
      return true;
    } catch (error) {
      console.error('[StorageService] Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Get a value, respecting expiration
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return defaultValue;
      
      const storageItem = JSON.parse(item) as StorageItem<T>;
      
      // Check if the item has expired
      if (
        storageItem.expiry &&
        storageItem.timestamp + storageItem.expiry < Date.now()
      ) {
        this.remove(key);
        return defaultValue;
      }
      
      return storageItem.value;
    } catch (error) {
      console.error('[StorageService] Error retrieving from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove a key
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('[StorageService] Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return false;
      
      const storageItem = JSON.parse(item) as StorageItem<any>;
      
      // Check if the item has expired
      if (
        storageItem.expiry &&
        storageItem.timestamp + storageItem.expiry < Date.now()
      ) {
        this.remove(key);
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all keys with the app prefix
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith(this.appPrefix + ':'))
        .map(k => k.replace(this.appPrefix + ':', ''));
    } catch (error) {
      console.error('[StorageService] Error getting keys from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all items with the app prefix
   */
  clear(): boolean {
    try {
      const keysToRemove = this.keys();
      keysToRemove.forEach(key => this.remove(key));
      return true;
    } catch (error) {
      console.error('[StorageService] Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get total size of all stored items in bytes
   */
  getSize(): number {
    try {
      let totalSize = 0;
      for (const key of this.keys()) {
        const item = localStorage.getItem(this.getKey(key));
        if (item) {
          totalSize += item.length * 2; // UTF-16 characters are 2 bytes each
        }
      }
      return totalSize;
    } catch (error) {
      console.error('[StorageService] Error calculating storage size:', error);
      return 0;
    }
  }
}

// Create a singleton instance
export const storageService = new StorageService();

// Hook for functional components
export const useStorage = () => {
  return storageService;
};

export default storageService;