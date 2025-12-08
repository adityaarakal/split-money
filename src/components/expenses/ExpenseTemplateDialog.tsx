import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as UseTemplateIcon,
  Bookmark as TemplateIcon,
} from '@mui/icons-material';
import {
  getAllTemplates,
  deleteTemplate,
  applyTemplate,
  type ExpenseTemplate,
} from '../../services/expense-template.service';
import type { Expense, ExpenseSplit } from '../../types';

interface ExpenseTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (expense: Expense, splits: ExpenseSplit[]) => void;
  groupId: string;
  members: Array<{ id: string; name: string }>;
}

function ExpenseTemplateDialog({
  open,
  onClose,
  onUseTemplate,
  groupId,
  members,
}: ExpenseTemplateDialogProps) {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
      setError(null);
    }
  }, [open]);

  const loadTemplates = () => {
    setTemplates(getAllTemplates());
  };

  const handleUseTemplate = (template: ExpenseTemplate) => {
    try {
      setError(null);
      
      // Check if all template members exist in current group
      const missingMembers = template.memberIds.filter(
        (id) => !members.some((m) => m.id === id)
      );
      
      if (missingMembers.length > 0) {
        setError('Some members from this template are not in the current group');
        return;
      }

      // Get paid by member (use first member or prompt)
      const paidBy = members.length > 0 ? members[0].id : '';
      if (!paidBy) {
        setError('No members available in this group');
        return;
      }

      const { expense, splits } = applyTemplate(template, groupId, paidBy, new Date());
      onUseTemplate(expense, splits);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
    }
  };

  const handleDelete = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    if (!window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      deleteTemplate(templateId);
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TemplateIcon />
          Expense Templates
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {templates.length === 0 ? (
          <Box textAlign="center" py={4}>
            <TemplateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No templates yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create templates from expenses to quickly add similar expenses
            </Typography>
          </Box>
        ) : (
          <List>
            {templates.map((template, index) => (
              <Box key={template.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleUseTemplate(template)}
                        disabled={loading}
                        color="primary"
                        title="Use template"
                      >
                        <UseTemplateIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(template.id)}
                        disabled={loading}
                        color="error"
                        title="Delete template"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={template.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {template.description} • ${template.amount.toFixed(2)} • {template.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.memberIds.length} member{template.memberIds.length !== 1 ? 's' : ''} • {template.splitType} split
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < templates.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExpenseTemplateDialog;

