import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import type { Settlement } from '../../types/settlement';
import { settlementRepository } from '../../repositories';
import { format } from 'date-fns';
import {
  exportSettlementsAsCSV,
  downloadCSV,
} from '../../services/balance-export.service';

interface SettlementHistoryProps {
  groupId: string;
  groupName?: string;
  members: Array<{ id: string; name: string }>;
}

function SettlementHistory({ groupId, groupName, members }: SettlementHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    loadSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupSettlements = await settlementRepository.getByGroupId(groupId);
      // Sort by date, newest first
      groupSettlements.sort((a, b) => {
        const dateA = a.settledAt instanceof Date ? a.settledAt : new Date(a.settledAt);
        const dateB = b.settledAt instanceof Date ? b.settledAt : new Date(b.settledAt);
        return dateB.getTime() - dateA.getTime();
      });
      setSettlements(groupSettlements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlement history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6" component="h2">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Settlement History
        </Typography>
        {settlements.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const csv = exportSettlementsAsCSV(settlements, groupName || 'Group', members);
              downloadCSV(csv, `settlements-${groupId}-${Date.now()}.csv`);
            }}
          >
            Export CSV
          </Button>
        )}
      </Box>

      {settlements.length === 0 ? (
        <Alert severity="info">
          No settlements recorded yet. Record a settlement to track payment history.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <List>
              {settlements.map((settlement) => {
                const settledDate = settlement.settledAt instanceof Date 
                  ? settlement.settledAt 
                  : new Date(settlement.settledAt);
                
                return (
                  <ListItem
                    key={settlement.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="body1">
                            <strong>{getMemberName(settlement.fromMemberId)}</strong> paid{' '}
                            <strong>{getMemberName(settlement.toMemberId)}</strong>
                          </Typography>
                          <Chip
                            label={`$${settlement.amount.toFixed(2)}`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {settlement.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {settlement.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {format(settledDate, 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default SettlementHistory;

