/**
 * Offline Detection Utility
 * 
 * Detects online/offline status and provides event listeners
 */

export type OnlineStatus = 'online' | 'offline' | 'unknown';

class OfflineDetector {
  private listeners: Set<(status: OnlineStatus) => void> = new Set();
  private currentStatus: OnlineStatus;

  constructor() {
    this.currentStatus = navigator.onLine ? 'online' : 'offline';
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.currentStatus = 'online';
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.currentStatus = 'offline';
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }

  /**
   * Get current online status
   */
  getStatus(): OnlineStatus {
    return this.currentStatus;
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  /**
   * Subscribe to online status changes
   */
  subscribe(listener: (status: OnlineStatus) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Singleton instance
export const offlineDetector = new OfflineDetector();
