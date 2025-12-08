import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import {
  Payment as PaymentIcon,
} from '@mui/icons-material';
import type { Settlement } from '../../types/settlement';
import { settlementRepository } from '../../repositories';
import { generateId } from '../../utils/id';
import { clearBalanceCache } from '../../services/balance-optimization.service';

interface SettlementDialogProps {
  open: boolean;
  onClose: () => void;
  onSettle: () => void;
  groupId: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

function SettlementDialog({
  open,
  onClose,
  onSettle,
  groupId,
  fromMemberId,
  fromMemberName,
  toMemberId,
  toMemberName,
  amount,
}: SettlementDialogProps) {
  const [settlementAmount, setSettlementAmount] = useState(amount.toString());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSettlementAmount(amount.toString());
      setDescription(`Settlement from ${fromMemberName} to ${toMemberName}`);
      setError(null);
    }
  }, [open, amount, fromMemberName, toMemberName]);

  const handleSubmit = async () => {
    const amountNum = parseFloat(settlementAmount);
    if (!amountNum || amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (amountNum > amount) {
      setError(`Amount cannot exceed ${amount.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const settlement: Settlement = {
        id: generateId(),
        groupId,
        fromMemberId,
        toMemberId,
        amount: amountNum,
        description: description.trim() || undefined,
        settledAt: new Date(),
        createdAt: new Date(),
      };

      await settlementRepository.create(settlement);

      // Mark relevant expense splits as settled
      // This is a simplified approach - in a full implementation,
      // you'd track which specific splits were settled
      clearBalanceCache(groupId);
      
      onSettle();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSettlementAmount(amount.toString());
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PaymentIcon />
          Record Settlement
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Settlement Details
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{fromMemberName}</strong> will pay <strong>{toMemberName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maximum amount: ${amount.toFixed(2)}
          </Typography>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          label="Amount"
          type="number"
          fullWidth
          variant="outlined"
          value={settlementAmount}
          onChange={(e) => setSettlementAmount(e.target.value)}
          required
          disabled={loading}
          inputProps={{ min: 0, max: amount, step: 0.01 }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Description (Optional)"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Add a note about this settlement..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !settlementAmount || parseFloat(settlementAmount) <= 0}
        >
          {loading ? 'Recording...' : 'Record Settlement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettlementDialog;

