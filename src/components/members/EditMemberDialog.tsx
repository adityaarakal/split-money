import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { Member } from '../../types';

interface EditMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (memberId: string, updates: Partial<Member>) => Promise<void>;
  member: Member | null;
}

function EditMemberDialog({ open, onClose, onUpdate, member }: EditMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && member) {
      setName(member.name);
      setEmail(member.email || '');
      setError(null);
    }
  }, [open, member]);

  const handleSubmit = async () => {
    if (!member || !name.trim()) {
      setError('Member name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onUpdate(member.id, {
        name: name.trim(),
        email: email.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setEmail('');
      setError(null);
      onClose();
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Edit Member
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Member Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Email (Optional)"
          fullWidth
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditMemberDialog;


