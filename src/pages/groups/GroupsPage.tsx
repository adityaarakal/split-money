import { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { groupRepository } from '../../repositories';
import type { Group } from '../../types';
import { generateId } from '../../utils/id';
import CreateGroupDialog from '../../components/groups/CreateGroupDialog';
import BackupRestoreDialog from '../../components/expenses/BackupRestoreDialog';

function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const allGroups = await groupRepository.getAll();
      setGroups(allGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name: string, description?: string) => {
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
    navigate(`/groups/${newGroup.id}`);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) {
      return;
    }
    try {
      await groupRepository.delete(groupId);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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

      {filteredGroups.length === 0 ? (
        <Box
          textAlign="center"
          py={8}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            color: 'white',
          }}
        >
          <GroupIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No groups found' : 'No groups yet'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first group to get started'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Create Group
            </Button>
          )}
        </Box>
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {group.name}
                  </Typography>
                  {group.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {group.description}
                    </Typography>
                  )}
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Members
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/groups/${group.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    </Container>
  );
}

export default GroupsPage;

