/**
 * Theme Toggle Component
 * 
 * Component for switching between light, dark, and system theme modes
 */

import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Brightness4, Brightness7, SettingsBrightness } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

export function ThemeToggle() {
  const { mode, theme, setMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  const getIcon = () => {
    if (mode === 'system') {
      return <SettingsBrightness />;
    }
    return theme === 'dark' ? <Brightness7 /> : <Brightness4 />;
  };

  const getTooltip = () => {
    if (mode === 'system') {
      return `System theme (${theme === 'dark' ? 'dark' : 'light'})`;
    }
    return `Current theme: ${theme}`;
  };

  return (
    <>
      <Tooltip title={getTooltip()}>
        <IconButton onClick={handleClick} color="inherit">
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleModeChange('light')}
          selected={mode === 'light'}
        >
          <Brightness7 sx={{ mr: 1 }} />
          Light
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange('dark')}
          selected={mode === 'dark'}
        >
          <Brightness4 sx={{ mr: 1 }} />
          Dark
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange('system')}
          selected={mode === 'system'}
        >
          <SettingsBrightness sx={{ mr: 1 }} />
          System
        </MenuItem>
      </Menu>
    </>
  );
}


