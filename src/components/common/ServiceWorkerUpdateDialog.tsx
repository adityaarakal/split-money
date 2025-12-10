/**
 * Service Worker Update Dialog
 * 
 * Dialog to prompt user to update the app when a new version is available
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useServiceWorkerUpdate } from '../../hooks/useServiceWorkerUpdate';

interface ServiceWorkerUpdateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ServiceWorkerUpdateDialog({
  open,
  onClose,
}: ServiceWorkerUpdateDialogProps) {
  const { skipWaiting, isUpdating } = useServiceWorkerUpdate();

  const handleUpdate = async () => {
    await skipWaiting();
    // Page will reload automatically after update
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Available</DialogTitle>
      <DialogContent>
        <DialogContentText>
          A new version of the app is available. Would you like to update now?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>
          Later
        </Button>
        <Button onClick={handleUpdate} variant="contained" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
