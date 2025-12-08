import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import type { Expense, Member } from '../../types';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

function ExpenseCard({
  expense,
  members,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onUnarchive,
}: ExpenseCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const paidByMember = members.find((m) => m.id === expense.paidBy);

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDelete = () => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDelete();
    }
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate();
  };

  const handleArchive = () => {
    handleMenuClose();
    if (expense.settled && onUnarchive) {
      onUnarchive();
    } else if (!expense.settled && onArchive) {
      onArchive();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          boxShadow: 1,
        },
      }}
      onClick={onClick}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              {expense.description}
            </Typography>
            <Chip label={expense.category} size="small" variant="outlined" />
            {expense.settled && (
              <Chip label="Settled" size="small" color="success" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Paid by {paidByMember?.name || 'Unknown'} •{' '}
            {format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'MMM dd, yyyy')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" color="primary">
            ${expense.amount.toFixed(2)}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {(onArchive || onUnarchive) && (
          <MenuItem onClick={handleArchive}>
            <ListItemIcon>
              {expense.settled ? (
                <UnarchiveIcon fontSize="small" />
              ) : (
                <ArchiveIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{expense.settled ? 'Unarchive' : 'Archive'}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ExpenseCard;

