/**
 * PWA Install Button Component
 * 
 * Button to prompt PWA installation
 */

import { Button, ButtonProps } from '@mui/material';
import { GetApp as GetAppIcon } from '@mui/icons-material';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps extends Omit<ButtonProps, 'onClick'> {
  onInstalled?: () => void;
}

export function PWAInstallButton({ onInstalled, ...buttonProps }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    const installed = await promptInstall();
    if (installed && onInstalled) {
      onInstalled();
    }
  };

  return (
    <Button
      {...buttonProps}
      startIcon={<GetAppIcon />}
      onClick={handleClick}
      variant="outlined"
    >
      Install App
    </Button>
  );
}
