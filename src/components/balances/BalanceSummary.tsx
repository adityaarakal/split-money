import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { IconButton, Button } from '@mui/material';
import type { Member } from '../../types';
import { getCachedGroupBalances, type Debt } from '../../services/balance-optimization.service';
import {
  exportBalanceSummaryAsCSV,
  exportDebtsAsCSV,
  downloadCSV,
} from '../../services/balance-export.service';
import BalanceVisualization from './BalanceVisualization';

interface BalanceSummaryProps {
  groupId: string;
  members: Member[];
  groupName?: string;
  onSettle?: (debt: Debt) => void;
}

function BalanceSummary({ groupId, members, groupName, onSettle }: BalanceSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Array<{ memberId: string; memberName: string; totalOwed: number }>>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  const loadBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const { summary: balanceSummary, debts: groupDebts } = await getCachedGroupBalances(groupId, members);
      setSummary(balanceSummary);
      setDebts(groupDebts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, members]);

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

  const totalOwed = summary.reduce((sum, item) => sum + Math.max(0, item.totalOwed), 0);
  const totalOwedTo = summary.reduce((sum, item) => sum + Math.abs(Math.min(0, item.totalOwed)), 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6" component="h2">
          <BalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Balance Summary
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => {
            const csv = exportBalanceSummaryAsCSV(summary, groupName || 'Group');
            downloadCSV(csv, `balance-summary-${groupId}-${Date.now()}.csv`);
          }}
        >
          Export CSV
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', sm: 'row' }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Owed
            </Typography>
            <Typography variant="h5" color="error">
              ${totalOwed.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Owed To
            </Typography>
            <Typography variant="h5" color="success.main">
              ${totalOwedTo.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <BalanceVisualization summary={summary} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Member Balances
          </Typography>
          <List>
            {summary.map((item) => (
              <ListItem
                key={item.memberId}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={item.memberName}
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      {item.totalOwed > 0 ? (
                        <>
                          <TrendingUpIcon fontSize="small" color="error" />
                          <Typography variant="body2" color="error">
                            Owes ${Math.abs(item.totalOwed).toFixed(2)}
                          </Typography>
                        </>
                      ) : item.totalOwed < 0 ? (
                        <>
                          <TrendingDownIcon fontSize="small" color="success" />
                          <Typography variant="body2" color="success.main">
                            Owed ${Math.abs(item.totalOwed).toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Settled up
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Chip
                  label={item.totalOwed > 0 ? 'Owes' : item.totalOwed < 0 ? 'Owed' : 'Settled'}
                  color={item.totalOwed > 0 ? 'error' : item.totalOwed < 0 ? 'success' : 'default'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {debts.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Who Owes Whom
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const csv = exportDebtsAsCSV(debts, groupName || 'Group');
                  downloadCSV(csv, `debts-${groupId}-${Date.now()}.csv`);
                }}
              >
                Export CSV
              </Button>
            </Box>
            <List>
              {debts.map((debt, index) => (
                <ListItem
                  key={`${debt.fromMemberId}-${debt.toMemberId}-${index}`}
                  secondaryAction={
                    onSettle && (
                      <IconButton
                        edge="end"
                        onClick={() => onSettle(debt)}
                        color="primary"
                        title="Record settlement"
                      >
                        <PaymentIcon />
                      </IconButton>
                    )
                  }
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
                      <Typography variant="body1">
                        <strong>{debt.fromMemberName}</strong> owes{' '}
                        <strong>{debt.toMemberName}</strong>
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                        ${debt.amount.toFixed(2)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {debts.length === 0 && summary.every((item) => Math.abs(item.totalOwed) < 0.01) && (
        <Alert severity="success">
          All members are settled up! No outstanding balances.
        </Alert>
      )}
    </Box>
  );
}

export default BalanceSummary;

