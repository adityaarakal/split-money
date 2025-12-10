/**
 * Balance Alerts Dialog
 * 
 * Displays balance alerts and allows users to configure alert preferences
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
  ListItemIcon,
  Alert as MuiAlert,
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  checkAllBalanceAlerts,
  getBalanceAlertPreferences,
  saveBalanceAlertPreferences,
  acknowledgeAlert,
  type BalanceAlert,
  type BalanceAlertPreferences,
} from '../../services/balance-alerts.service';
import { groupRepository } from '../../repositories';

interface BalanceAlertsDialogProps {
  open: boolean;
  onClose: () => void;
  currentMemberId?: string;
}

function BalanceAlertsDialog({
  open,
  onClose,
  currentMemberId,
}: BalanceAlertsDialogProps) {
  const [alerts, setAlerts] = useState<BalanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<BalanceAlertPreferences>(getBalanceAlertPreferences());
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      loadAlerts();
      setPreferences(getBalanceAlertPreferences());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMemberId]);

  const loadAlerts = async () => {
    if (!currentMemberId) return;
    
    try {
      setLoading(true);
      const groups = await groupRepository.getAll();
      const groupNames = new Map(groups.map((g) => [g.id, g.name]));
      const groupIds = groups.map((g) => g.id);
      
      const allAlerts = await checkAllBalanceAlerts(groupIds, groupNames, currentMemberId);
      // Filter out acknowledged alerts
      const unacknowledgedAlerts = allAlerts.filter(
        (alert) => !alert.acknowledged
      );
      setAlerts(unacknowledgedAlerts);
    } catch (error) {
      console.error('Error loading balance alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handlePreferenceChange = (key: keyof BalanceAlertPreferences, value: boolean | number) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    saveBalanceAlertPreferences(newPreferences);
  };

  const getSeverityIcon = (severity: BalanceAlert['severity']) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: BalanceAlert['severity']) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Balance Alerts</Typography>
          <IconButton
            onClick={() => setTabValue(tabValue === 0 ? 1 : 0)}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={`Alerts (${alerts.length})`} />
          <Tab label="Settings" />
        </Tabs>

        {tabValue === 0 && (
          <>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography>Loading alerts...</Typography>
              </Box>
            ) : alerts.length === 0 ? (
              <Box textAlign="center" p={3}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Balance Alerts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All balances are within normal thresholds.
                </Typography>
              </Box>
            ) : (
              <List>
                {alerts.map((alert) => (
                  <ListItem
                    key={alert.id}
                    secondaryAction={
                      <Button
                        size="small"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Dismiss
                      </Button>
                    }
                  >
                    <ListItemIcon>{getSeverityIcon(alert.severity)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <MuiAlert severity={getSeverityColor(alert.severity)} sx={{ mb: 1 }}>
                          {alert.message}
                        </MuiAlert>
                      }
                      secondary={`${alert.groupName} • ${new Date(alert.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.enabled}
                  onChange={(e) => handlePreferenceChange('enabled', e.target.checked)}
                />
              }
              label="Enable Balance Alerts"
            />
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Alert Thresholds
            </Typography>
            
            <TextField
              label="High Balance Threshold ($)"
              type="number"
              value={preferences.highBalanceThreshold}
              onChange={(e) =>
                handlePreferenceChange('highBalanceThreshold', Number(e.target.value))
              }
              fullWidth
              margin="normal"
              helperText="Alert when any balance exceeds this amount"
            />
            
            {currentMemberId && (
              <>
                <TextField
                  label="Owed To You Threshold ($)"
                  type="number"
                  value={preferences.owedToYouThreshold}
                  onChange={(e) =>
                    handlePreferenceChange('owedToYouThreshold', Number(e.target.value))
                  }
                  fullWidth
                  margin="normal"
                  helperText="Alert when someone owes you more than this amount"
                />
                
                <TextField
                  label="You Owe Threshold ($)"
                  type="number"
                  value={preferences.youOweThreshold}
                  onChange={(e) =>
                    handlePreferenceChange('youOweThreshold', Number(e.target.value))
                  }
                  fullWidth
                  margin="normal"
                  helperText="Alert when you owe more than this amount"
                />
              </>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Alert Types
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.showHighBalanceAlerts}
                  onChange={(e) =>
                    handlePreferenceChange('showHighBalanceAlerts', e.target.checked)
                  }
                  disabled={!preferences.enabled}
                />
              }
              label="Show High Balance Alerts"
            />
            
            {currentMemberId && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.showOwedToYouAlerts}
                      onChange={(e) =>
                        handlePreferenceChange('showOwedToYouAlerts', e.target.checked)
                      }
                      disabled={!preferences.enabled}
                    />
                  }
                  label="Show Owed To You Alerts"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.showYouOweAlerts}
                      onChange={(e) =>
                        handlePreferenceChange('showYouOweAlerts', e.target.checked)
                      }
                      disabled={!preferences.enabled}
                    />
                  }
                  label="Show You Owe Alerts"
                />
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BalanceAlertsDialog;
