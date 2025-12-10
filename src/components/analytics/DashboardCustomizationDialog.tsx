/**
 * Dashboard Customization Dialog
 * 
 * Allows users to customize dashboard widgets (show/hide, reorder)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  DragHandle as DragHandleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  getDashboardPreferences,
  saveDashboardPreferences,
  resetDashboardPreferences,
  type DashboardWidget,
} from '../../services/dashboard-preferences.service';

interface DashboardCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

function DashboardCustomizationDialog({
  open,
  onClose,
  onSave,
}: DashboardCustomizationDialogProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    if (open) {
      const preferences = getDashboardPreferences();
      setWidgets([...preferences.widgets].sort((a, b) => a.order - b.order));
    }
  }, [open]);

  const handleToggleVisibility = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newWidgets = [...widgets];
    [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    newWidgets[index - 1].order = index - 1;
    newWidgets[index].order = index;
    setWidgets(newWidgets);
  };

  const handleSave = () => {
    const preferences = {
      widgets: widgets.map((w, index) => ({ ...w, order: index })),
      defaultTab: 0,
    };
    saveDashboardPreferences(preferences);
    onSave?.();
    onClose();
  };

  const handleReset = () => {
    resetDashboardPreferences();
    const preferences = getDashboardPreferences();
    setWidgets([...preferences.widgets].sort((a, b) => a.order - b.order));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customize Dashboard</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Show or hide widgets and reorder them to customize your dashboard view.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {widgets.map((widget, index) => (
            <ListItem
              key={widget.id}
              secondaryAction={
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    edge="end"
                    onClick={() => handleToggleVisibility(widget.id)}
                    size="small"
                  >
                    {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    size="small"
                  >
                    <DragHandleIcon />
                  </IconButton>
                </Box>
              }
            >
              <Checkbox
                checked={widget.visible}
                onChange={() => handleToggleVisibility(widget.id)}
                edge="start"
              />
              <ListItemText
                primary={widget.label}
                secondary={widget.visible ? 'Visible' : 'Hidden'}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Defaults
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DashboardCustomizationDialog;
