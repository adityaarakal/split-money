import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import type { Expense, ExpenseSplit, Member } from '../../types';
import {
  calculateEqualSplit,
  calculateCustomSplit,
  calculatePercentageSplit,
  type SplitType,
} from '../../utils/expense-split';
import { format } from 'date-fns';

interface EditExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (expense: Expense, splits: ExpenseSplit[]) => Promise<void>;
  expense: Expense | null;
  existingSplits: ExpenseSplit[];
  members: Member[];
}

import { getCategoryNames } from '../../services/category.service';

// Get categories dynamically
const getExpenseCategories = () => getCategoryNames();

function EditExpenseDialog({
  open,
  onClose,
  onUpdate,
  expense,
  existingSplits,
  members,
}: EditExpenseDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setPaidBy(expense.paidBy);
      setDate(format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'yyyy-MM-dd'));
      setNotes(expense.notes || '');
      
      // Determine split type from existing splits
      const hasPercentages = existingSplits.some((s) => s.percentage !== undefined);
      const amountsEqual = existingSplits.length > 0 && 
        existingSplits.every((s) => 
          Math.abs(s.amount - expense.amount / existingSplits.length) < 0.01
        );
      
      if (hasPercentages) {
        setSplitType('percentage');
        const pctMap: Record<string, string> = {};
        existingSplits.forEach((split) => {
          if (split.percentage !== undefined) {
            pctMap[split.memberId] = split.percentage.toString();
          }
        });
        setPercentages(pctMap);
      } else if (amountsEqual) {
        setSplitType('equal');
      } else {
        setSplitType('custom');
        const amountMap: Record<string, string> = {};
        existingSplits.forEach((split) => {
          amountMap[split.memberId] = split.amount.toString();
        });
        setCustomAmounts(amountMap);
      }
      
      setSelectedMembers(existingSplits.map((s) => s.memberId));
      setError(null);
    }
  }, [open, expense, existingSplits]);

  const handleSubmit = async () => {
    if (!expense || !description.trim()) {
      setError('Description is required');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!paidBy) {
      setError('Please select who paid');
      return;
    }
    if (selectedMembers.length === 0) {
      setError('At least one member must be selected');
      return;
    }

    const expenseAmount = parseFloat(amount);
    let splitResult;

    switch (splitType) {
      case 'equal': {
        splitResult = calculateEqualSplit(expenseAmount, selectedMembers, expense.id);
        break;
      }
      case 'custom': {
        const customAmountsNum: Record<string, number> = {};
        for (const [memberId, amountStr] of Object.entries(customAmounts)) {
          const amt = parseFloat(amountStr);
          if (!isNaN(amt)) {
            customAmountsNum[memberId] = amt;
          }
        }
        splitResult = calculateCustomSplit(expenseAmount, customAmountsNum, expense.id);
        break;
      }
      case 'percentage': {
        const percentagesNum: Record<string, number> = {};
        for (const [memberId, pctStr] of Object.entries(percentages)) {
          const pct = parseFloat(pctStr);
          if (!isNaN(pct)) {
            percentagesNum[memberId] = pct;
          }
        }
        splitResult = calculatePercentageSplit(expenseAmount, percentagesNum, expense.id);
        break;
      }
    }

    if (!splitResult.isValid) {
      setError(splitResult.errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedExpense: Expense = {
        ...expense,
        description: description.trim(),
        amount: expenseAmount,
        category,
        paidBy,
        date: new Date(date),
        notes: notes.trim() || undefined,
      };

      await onUpdate(updatedExpense, splitResult.splits);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          Edit Expense
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                {getExpenseCategories().map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Paid By</InputLabel>
              <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} label="Paid By">
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Members ({selectedMembers.length} selected)
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {members.map((member) => (
              <Chip
                key={member.id}
                label={member.name}
                color={selectedMembers.includes(member.id) ? 'primary' : 'default'}
                onClick={() => toggleMemberSelection(member.id)}
                clickable
              />
            ))}
          </Box>

          <Tabs value={splitType} onChange={(_, v) => setSplitType(v)} sx={{ mb: 2 }}>
            <Tab label="Equal" value="equal" />
            <Tab label="Custom" value="custom" />
            <Tab label="Percentage" value="percentage" />
          </Tabs>

          {splitType === 'custom' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Amounts
              </Typography>
              {selectedMembers.map((memberId) => (
                <TextField
                  key={memberId}
                  margin="dense"
                  label={getMemberName(memberId)}
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={customAmounts[memberId] || ''}
                  onChange={(e) =>
                    setCustomAmounts({ ...customAmounts, [memberId]: e.target.value })
                  }
                  disabled={loading}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          )}

          {splitType === 'percentage' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Percentages (must sum to 100%)
              </Typography>
              {selectedMembers.map((memberId) => (
                <TextField
                  key={memberId}
                  margin="dense"
                  label={getMemberName(memberId)}
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={percentages[memberId] || ''}
                  onChange={(e) =>
                    setPercentages({ ...percentages, [memberId]: e.target.value })
                  }
                  disabled={loading}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Updating...' : 'Update Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditExpenseDialog;

