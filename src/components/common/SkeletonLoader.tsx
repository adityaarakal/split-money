/**
 * Skeleton Loader Components
 * 
 * Reusable skeleton loaders for various content types
 */

import { Skeleton, Box, Card, CardContent } from '@mui/material';

export function SkeletonCard() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Box>
      <Box display="flex" gap={2} sx={{ mb: 2 }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={32} />
        ))}
      </Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" gap={2} sx={{ mb: 1 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height={24} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function SkeletonExpenseCard() {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="20%" height={24} />
        </Box>
        <Skeleton variant="text" width="60%" height={20} />
        <Box display="flex" gap={1} sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
}


