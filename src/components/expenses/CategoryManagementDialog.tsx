import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  getAllCategories,
  addCustomCategory,
  deleteCustomCategory,
  updateCustomCategory,
  type Category,
} from '../../services/category.service';

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

function CategoryManagementDialog({ open, onClose }: CategoryManagementDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
      setError(null);
      setEditingId(null);
      setEditName('');
      setNewCategoryName('');
    }
  }, [open]);

  const loadCategories = () => {
    setCategories(getAllCategories());
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      addCustomCategory(newCategoryName.trim());
      setNewCategoryName('');
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    if (category.isDefault) return;
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      updateCustomCategory(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || category.isDefault) return;

    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      deleteCustomCategory(categoryId);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const customCategories = categories.filter((cat) => !cat.isDefault);
  const defaultCategories = categories.filter((cat) => cat.isDefault);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CategoryIcon />
          Manage Categories
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Add New Category
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleAddCategory();
                }
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              disabled={loading || !newCategoryName.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {customCategories.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Custom Categories
            </Typography>
            <List dense>
              {customCategories.map((category) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    editingId === category.id ? (
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={handleSaveEdit}
                          disabled={loading}
                          color="primary"
                          size="small"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={handleCancelEdit}
                          disabled={loading}
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => handleStartEdit(category)}
                          disabled={loading}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(category.id)}
                          disabled={loading}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  {editingId === category.id ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          handleSaveEdit();
                        }
                        if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <ListItemText primary={category.name} />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Default Categories
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {defaultCategories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                variant="outlined"
                disabled
                size="small"
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Default categories cannot be edited or deleted
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryManagementDialog;

