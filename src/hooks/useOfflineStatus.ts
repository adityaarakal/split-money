/**
 * useOfflineStatus Hook
 * 
 * React hook for tracking online/offline status
 */

import { useState, useEffect } from 'react';
import { offlineDetector, type OnlineStatus } from '../utils/offline-detection';

export function useOfflineStatus() {
  const [status, setStatus] = useState<OnlineStatus>(offlineDetector.getStatus());

  useEffect(() => {
    const unsubscribe = offlineDetector.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline: status === 'online',
    isOffline: status === 'offline',
    status,
  };
}
