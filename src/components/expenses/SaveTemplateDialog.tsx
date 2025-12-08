import { useState } from 'react';
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
import { Bookmark as TemplateIcon } from '@mui/icons-material';
import { createTemplate } from '../../services/expense-template.service';
import type { Expense, ExpenseSplit } from '../../types';

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense;
  splits: ExpenseSplit[];
}

function SaveTemplateDialog({ open, onClose, expense, splits }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine split type
      const hasPercentages = splits.some((s) => s.percentage !== undefined);
      const amountsEqual = splits.length > 0 && 
        splits.every((s) => 
          Math.abs(s.amount - expense.amount / splits.length) < 0.01
        );

      let splitType: 'equal' | 'custom' | 'percentage';
      let customAmounts: Record<string, number> | undefined;
      let percentages: Record<string, number> | undefined;

      if (hasPercentages) {
        splitType = 'percentage';
        percentages = {};
        splits.forEach((split) => {
          if (split.percentage !== undefined) {
            percentages![split.memberId] = split.percentage;
          }
        });
      } else if (amountsEqual) {
        splitType = 'equal';
      } else {
        splitType = 'custom';
        customAmounts = {};
        splits.forEach((split) => {
          customAmounts![split.memberId] = split.amount;
        });
      }

      createTemplate(
        templateName.trim(),
        expense,
        splits,
        splitType,
        customAmounts,
        percentages
      );

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTemplateName('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TemplateIcon />
          Save as Template
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Save this expense as a template to quickly create similar expenses in the future.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          label="Template Name"
          placeholder="e.g., Weekly Groceries"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading && templateName.trim()) {
              handleSubmit();
            }
          }}
        />

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Template will include:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            • Description: {expense.description}
          </Typography>
          <Typography variant="body2">
            • Amount: ${expense.amount.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            • Category: {expense.category}
          </Typography>
          <Typography variant="body2">
            • Split: {splits.length} member{splits.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !templateName.trim()}
        >
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveTemplateDialog;

