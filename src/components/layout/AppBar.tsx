/**
 * App Bar Component
 * 
 * Main navigation bar with theme toggle and navigation
 */

import { AppBar as MuiAppBar, Toolbar, Typography, Box } from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';

export function AppBar() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/groups');
  };

  return (
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
        <ThemeToggle />
      </Toolbar>
    </MuiAppBar>
  );
}

