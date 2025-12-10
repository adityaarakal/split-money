/**
 * Error State Component
 * 
 * Reusable error state component for displaying errors
 */

import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ py: 6, px: 2, textAlign: 'center' }}
    >
      <ErrorIcon
        sx={{
          fontSize: 64,
          color: 'error.main',
          mb: 2,
        }}
      />
      <Typography variant="h6" color="error" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" color="error" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Box>
  );
}


