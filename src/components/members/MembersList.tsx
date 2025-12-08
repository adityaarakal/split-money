import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Member } from '../../types';

interface MembersListProps {
  members: Member[];
  onMemberDelete: (memberId: string) => Promise<void>;
}

function MembersList({ members, onMemberDelete }: MembersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    try {
      setDeletingId(memberId);
      await onMemberDelete(memberId);
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (members.length === 0) {
    return (
      <Box
        textAlign="center"
        py={4}
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No members yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add members to start tracking expenses
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {members.map((member) => (
        <ListItem
          key={member.id}
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDelete(member.id)}
              disabled={deletingId === member.id}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          }
          sx={{
            borderRadius: 1,
            mb: 1,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
              }}
            >
              {getInitials(member.name)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={member.name}
            secondary={member.email || 'No email'}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default MembersList;

