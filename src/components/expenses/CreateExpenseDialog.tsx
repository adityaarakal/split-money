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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { Member, Expense, ExpenseSplit } from '../../types';
import { generateId } from '../../utils/id';
import {
  calculateEqualSplit,
  calculateCustomSplit,
  calculatePercentageSplit,
  type SplitType,
} from '../../utils/expense-split';
import { format } from 'date-fns';

interface CreateExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (expense: Expense, splits: ExpenseSplit[]) => Promise<void>;
  groupId: string;
  members: Member[];
}

import { getCategoryNames } from '../../services/category.service';

// Get categories dynamically
const getExpenseCategories = () => getCategoryNames();

function CreateExpenseDialog({
  open,
  onClose,
  onCreate,
  groupId,
  members,
}: CreateExpenseDialogProps) {
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
  const [splitPreview, setSplitPreview] = useState<ExpenseSplit[]>([]);

  useEffect(() => {
    if (members.length > 0 && !paidBy) {
      setPaidBy(members[0].id);
    }
    if (members.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [members, paidBy, selectedMembers.length]);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setDescription('');
      setAmount('');
      const categories = getExpenseCategories();
      setCategory(categories.length > 0 ? categories[0] : '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setSplitType('equal');
      setSelectedMembers(members.map((m) => m.id));
      setCustomAmounts({});
      setPercentages({});
      setNotes('');
      setError(null);
      setSplitPreview([]);
    }
  }, [open, members]);

  useEffect(() => {
    calculatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, splitType, selectedMembers, customAmounts, percentages]);

  const calculatePreview = () => {
    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0 || selectedMembers.length === 0) {
      setSplitPreview([]);
      return;
    }

    const expenseId = 'preview';
    let result;

    switch (splitType) {
      case 'equal': {
        result = calculateEqualSplit(expenseAmount, selectedMembers, expenseId);
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
        result = calculateCustomSplit(expenseAmount, customAmountsNum, expenseId);
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
        result = calculatePercentageSplit(expenseAmount, percentagesNum, expenseId);
        break;
      }
    }

    setSplitPreview(result.splits);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
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
    const expenseId = generateId();
    let splitResult;

    switch (splitType) {
      case 'equal': {
        splitResult = calculateEqualSplit(expenseAmount, selectedMembers, expenseId);
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
        splitResult = calculateCustomSplit(expenseAmount, customAmountsNum, expenseId);
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
        splitResult = calculatePercentageSplit(expenseAmount, percentagesNum, expenseId);
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

      const expense: Expense = {
        id: expenseId,
        groupId,
        paidBy,
        amount: expenseAmount,
        description: description.trim(),
        category,
        date: new Date(date),
        settled: false,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      };

      await onCreate(expense, splitResult.splits);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDescription('');
      setAmount('');
      const categories = getExpenseCategories();
      setCategory(categories.length > 0 ? categories[0] : '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setSplitType('equal');
      setSelectedMembers(members.map((m) => m.id));
      setCustomAmounts({});
      setPercentages({});
      setNotes('');
      setError(null);
      setSplitPreview([]);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon />
          Create New Expense
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
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            placeholder="Add any additional notes or receipt information..."
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Split Expense
        </Typography>

        <Tabs value={splitType} onChange={(_, v) => setSplitType(v)} sx={{ mb: 2 }}>
          <Tab label="Equal" value="equal" />
          <Tab label="Custom" value="custom" />
          <Tab label="Percentage" value="percentage" />
        </Tabs>

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

        {splitPreview.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Split Preview
            </Typography>
            <List dense>
              {splitPreview.map((split) => (
                <ListItem key={split.memberId}>
                  <ListItemText
                    primary={getMemberName(split.memberId)}
                    secondary={
                      split.percentage
                        ? `${split.percentage.toFixed(1)}% = $${split.amount.toFixed(2)}`
                        : `$${split.amount.toFixed(2)}`
                    }
                  />
                  <ListItemSecondaryAction>
                    {split.memberId === paidBy && (
                      <CheckCircleIcon color="primary" fontSize="small" />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateExpenseDialog;

