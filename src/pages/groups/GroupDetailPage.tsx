import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { groupRepository, memberRepository } from '../../repositories';
import type { Group, Member } from '../../types';
import { generateId } from '../../utils/id';
import MembersList from '../../components/members/MembersList';

function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const groupData = await groupRepository.getById(groupId);
      if (!groupData) {
        setError('Group not found');
        return;
      }
      setGroup(groupData);
      setEditName(groupData.name);
      setEditDescription(groupData.description || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!groupId) return;
    try {
      const groupMembers = await memberRepository.getByGroupId(groupId);
      setMembers(groupMembers);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleUpdateGroup = async () => {
    if (!group || !editName.trim()) return;
    try {
      await groupRepository.update(group.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      await loadGroup();
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    try {
      await groupRepository.delete(group.id);
      navigate('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const handleAddMember = async (name: string, email?: string) => {
    if (!groupId || !name.trim()) return;
    const newMember: Member = {
      id: generateId(),
      groupId,
      name: name.trim(),
      email: email?.trim() || undefined,
      joinedAt: new Date(),
    };
    await memberRepository.create(newMember);
    await loadMembers();
    setAddMemberDialogOpen(false);
  };

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

  if (error && !group) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groups')}
          sx={{ mt: 2 }}
        >
          Back to Groups
        </Button>
      </Container>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate('/groups')}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {group.name}
          </Typography>
          {group.description && (
            <Typography variant="body1" color="text.secondary" mt={1}>
              {group.description}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteGroup}
        >
          Delete
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Members ({members.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMemberDialogOpen(true)}
            >
              Add Member
            </Button>
          </Box>
          <MembersList
            members={members}
            onMemberDelete={async (memberId) => {
              await memberRepository.delete(memberId);
              await loadMembers();
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateGroup}
            variant="contained"
            disabled={!editName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onAdd={handleAddMember}
      />
    </Container>
  );
}

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, email?: string) => Promise<void>;
}

function AddMemberDialog({ open, onClose, onAdd }: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Member name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAdd(name.trim(), email.trim() || undefined);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setEmail('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Member</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Member Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Email (Optional)"
          fullWidth
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GroupDetailPage;

