import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ContentCopy as DuplicateIcon,
  Bookmark as SaveTemplateIcon,
} from '@mui/icons-material';
import type { Expense, ExpenseSplit, Member } from '../../types';
import { format } from 'date-fns';

interface ExpenseDetailDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  splits: ExpenseSplit[];
  members: Member[];
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate?: () => void;
}

function ExpenseDetailDialog({
  open,
  onClose,
  expense,
  splits,
  members,
  onEdit,
  onDelete,
  onDuplicate,
  onSaveAsTemplate,
}: ExpenseDetailDialogProps) {
  if (!expense) return null;

  const paidByMember = members.find((m) => m.id === expense.paidBy);
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{expense.description}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            ${expense.amount.toFixed(2)}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip label={expense.category} color="primary" variant="outlined" />
            <Chip
              label={expense.settled ? 'Settled' : 'Unsettled'}
              color={expense.settled ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Paid By
          </Typography>
          <Typography variant="body1">{paidByMember?.name || 'Unknown'}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Date
          </Typography>
          <Typography variant="body1">
            {format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'MMMM dd, yyyy')}
          </Typography>
        </Box>

        {expense.notes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {expense.notes}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Split Details
        </Typography>
        {splits.length === 0 ? (
          <Alert severity="warning">No split information available</Alert>
        ) : (
          <List dense>
            {splits.map((split) => (
              <ListItem key={split.id}>
                <ListItemText
                  primary={getMemberName(split.memberId)}
                  secondary={
                    split.percentage
                      ? `${split.percentage.toFixed(1)}%`
                      : undefined
                  }
                />
                <Typography variant="body1" fontWeight="medium">
                  ${split.amount.toFixed(2)}
                </Typography>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText primary="Total" />
              <Typography variant="body1" fontWeight="bold">
                ${totalSplit.toFixed(2)}
              </Typography>
            </ListItem>
          </List>
        )}

        {Math.abs(totalSplit - expense.amount) > 0.01 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Split total ({totalSplit.toFixed(2)}) does not match expense amount ({expense.amount.toFixed(2)})
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          <Button startIcon={<DuplicateIcon />} onClick={onDuplicate} color="inherit">
            Duplicate
          </Button>
          {onSaveAsTemplate && (
            <Button startIcon={<SaveTemplateIcon />} onClick={onSaveAsTemplate} color="inherit">
              Save as Template
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Close</Button>
          <Button startIcon={<EditIcon />} onClick={onEdit} variant="outlined">
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ExpenseDetailDialog;

