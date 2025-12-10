/**
 * useServiceWorkerUpdate Hook
 * 
 * React hook for detecting and handling service worker updates
 */

import { useState, useEffect } from 'react';

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return;

        // Check for waiting service worker
        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        // Listen for service worker updates
        const handleUpdateFound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available
                setUpdateAvailable(true);
              }
            }
          });
        };

        registration.addEventListener('updatefound', handleUpdateFound);

        // Listen for controller change (update activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setUpdateAvailable(false);
          setIsUpdating(false);
          // Reload page to use new service worker
          window.location.reload();
        });
      });
    }
  }, []);

  const skipWaiting = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        setIsUpdating(true);
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  return {
    updateAvailable,
    isUpdating,
    skipWaiting,
  };
}
