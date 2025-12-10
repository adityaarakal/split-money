import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { groupRepository } from '../../repositories';
import type { Group } from '../../types';
import { generateId } from '../../utils/id';
import CreateGroupDialog from '../../components/groups/CreateGroupDialog';
import BackupRestoreDialog from '../../components/expenses/BackupRestoreDialog';
import BalanceAlertsDialog from '../../components/balances/BalanceAlertsDialog';
import { useToast } from '../../context/ToastContext';
import { EmptyState, ErrorState, SkeletonList } from '../../components/common';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { checkAllBalanceAlerts } from '../../services/balance-alerts.service';

function GroupsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [balanceAlertsOpen, setBalanceAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      handler: () => setCreateDialogOpen(true),
    },
  ]);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allGroups = await groupRepository.getAll();
      setGroups(allGroups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load groups';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Check for balance alerts
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const groupNames = new Map(groups.map((g) => [g.id, g.name]));
        const groupIds = groups.map((g) => g.id);
        const alerts = await checkAllBalanceAlerts(groupIds, groupNames);
        setAlertCount(alerts.length);
      } catch (error) {
        console.error('Error checking balance alerts:', error);
      }
    };

    if (groups.length > 0) {
      checkAlerts();
    }
  }, [groups]);

  const handleCreateGroup = async (name: string, description?: string) => {
    try {
      const newGroup: Group = {
        id: generateId(),
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await groupRepository.create(newGroup);
      await loadGroups();
      setCreateDialogOpen(false);
      showSuccess(`Group "${name}" created successfully`);
      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      showError(errorMessage);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) {
      return;
    }
    try {
      await groupRepository.delete(groupId);
      await loadGroups();
      showSuccess('Group deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete group';
      showError(errorMessage);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <SkeletonList count={3} />
      </Container>
    );
  }

  if (error && groups.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorState message={error} onRetry={loadGroups} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Groups
        </Typography>
        <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {alertCount > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<NotificationsIcon />}
              onClick={() => setBalanceAlertsOpen(true)}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Alerts ({alertCount})
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setBackupDialogOpen(true)}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Backup
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Create Group
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredGroups.length === 0 && !loading ? (
        <EmptyState
          title={searchTerm ? 'No groups found' : 'No groups yet'}
          description={searchTerm ? 'Try adjusting your search terms' : 'Create your first group to get started'}
          actionLabel="Create Group"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <GroupIcon color="primary" />
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {group.name}
                    </Typography>
                  </Box>
                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Members
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                    color="error"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {error && groups.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <ErrorState message={error} onRetry={loadGroups} />
        </Box>
      )}

      <CreateGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateGroup}
      />

      <BackupRestoreDialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        onImportComplete={loadGroups}
      />

      <BalanceAlertsDialog
        open={balanceAlertsOpen}
        onClose={() => setBalanceAlertsOpen(false)}
      />
    </Container>
  );
}

export default GroupsPage;

