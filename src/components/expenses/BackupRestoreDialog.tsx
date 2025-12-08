import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import { downloadBackup, loadBackupFromFile, importBackup } from '../../services/backup.service';

interface BackupRestoreDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

function BackupRestoreDialog({ open, onClose, onImportComplete }: BackupRestoreDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await downloadBackup();
      setSuccess('Backup downloaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export backup');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const backup = await loadBackupFromFile(file);
      const clearExisting = window.confirm(
        'Do you want to clear existing data before importing? Click OK to clear, Cancel to merge.'
      );
      
      await importBackup(backup, clearExisting);
      setSuccess('Backup imported successfully!');
      onImportComplete();
      
      // Reset file input
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import backup');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BackupIcon />
          Backup & Restore
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Export your data as a backup file or import from a previous backup.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Export Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download all your groups, members, expenses, and splits as a JSON file.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            fullWidth
          >
            Download Backup
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Import Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Restore from a previous backup file. You can choose to merge or replace existing data.
          </Typography>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="backup-file-input"
            type="file"
            onChange={handleImport}
            disabled={loading}
          />
          <label htmlFor="backup-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={loading}
              fullWidth
            >
              Upload Backup File
            </Button>
          </label>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BackupRestoreDialog;

