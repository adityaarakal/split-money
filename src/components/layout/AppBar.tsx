/**
 * App Bar Component
 * 
 * Main navigation bar with theme toggle and navigation
 */

import { AppBar as MuiAppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import { Group as GroupIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import { PWAInstallButton } from '../common/PWAInstallButton';
import BalanceAlertsDialog from '../balances/BalanceAlertsDialog';
import { checkAllBalanceAlerts } from '../../services/balance-alerts.service';
import { groupRepository } from '../../repositories';

export function AppBar() {
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/groups');
  };

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const groups = await groupRepository.getAll();
        const groupNames = new Map(groups.map((g) => [g.id, g.name]));
        const groupIds = groups.map((g) => g.id);
        const alerts = await checkAllBalanceAlerts(groupIds, groupNames);
        setAlertCount(alerts.length);
      } catch (error) {
        console.error('Error checking balance alerts:', error);
      }
    };

    checkAlerts();
    // Check alerts every 30 seconds
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <MuiAppBar position="sticky" elevation={2}>
        <Toolbar>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: 'pointer', flexGrow: 1 }}
            onClick={handleLogoClick}
          >
            <GroupIcon />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Split Money
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {alertCount > 0 && (
              <IconButton
                color="inherit"
                onClick={() => setAlertsDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={alertCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            <PWAInstallButton size="small" />
            <ThemeToggle />
          </Box>
        </Toolbar>
      </MuiAppBar>
      <BalanceAlertsDialog
        open={alertsDialogOpen}
        onClose={() => setAlertsDialogOpen(false)}
      />
    </>
  );
}

