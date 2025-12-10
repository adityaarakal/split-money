/**
 * Offline Indicator Component
 * 
 * Shows offline status indicator to users
 */

import { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { CloudOff as CloudOffIcon, CloudDone as CloudDoneIcon } from '@mui/icons-material';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOffline, isOnline } = useOfflineStatus();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (isOnline && showOnlineMessage) {
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOnlineMessage]);

  useEffect(() => {
    if (isOnline && isOffline) {
      setShowOnlineMessage(true);
    }
  }, [isOnline, isOffline]);

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <Snackbar
          open={isOffline}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 8 }}
        >
          <Alert
            severity="warning"
            icon={<CloudOffIcon />}
            sx={{ width: '100%' }}
          >
            You're offline. Some features may be limited.
          </Alert>
        </Snackbar>
      )}

      {/* Online Message */}
      {showOnlineMessage && (
        <Snackbar
          open={showOnlineMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={3000}
          onClose={() => setShowOnlineMessage(false)}
          sx={{ mt: 8 }}
        >
          <Alert
            severity="success"
            icon={<CloudDoneIcon />}
            sx={{ width: '100%' }}
          >
            You're back online!
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
