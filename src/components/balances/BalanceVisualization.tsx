import { Box, Typography, LinearProgress } from '@mui/material';
import type { BalanceSummary } from '../../services/balance.service';

interface BalanceVisualizationProps {
  summary: BalanceSummary[];
}

function BalanceVisualization({ summary }: BalanceVisualizationProps) {
  // Calculate totals
  const totalOwed = summary.reduce((sum, item) => sum + Math.max(0, item.totalOwed), 0);
  const totalOwedTo = summary.reduce((sum, item) => sum + Math.abs(Math.min(0, item.totalOwed)), 0);
  const maxBalance = Math.max(totalOwed, totalOwedTo, ...summary.map((s) => Math.abs(s.totalOwed)));

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Balance Visualization
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Owed vs Total Owed To
        </Typography>
        <Box display="flex" gap={2} sx={{ mb: 1 }}>
          <Box flex={1}>
            <Typography variant="caption" color="error">
              Total Owed: ${totalOwed.toFixed(2)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalOwed > 0 ? (totalOwed / (totalOwed + totalOwedTo)) * 100 : 0}
              color="error"
              sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
            />
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="success.main">
              Total Owed To: ${totalOwedTo.toFixed(2)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalOwedTo > 0 ? (totalOwedTo / (totalOwed + totalOwedTo)) * 100 : 0}
              color="success"
              sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
            />
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Individual Balances
        </Typography>
        {summary.map((item) => {
          const balance = Math.abs(item.totalOwed);
          const percentage = maxBalance > 0 ? (balance / maxBalance) * 100 : 0;
          const isPositive = item.totalOwed > 0;
          const isNegative = item.totalOwed < 0;
          
          return (
            <Box key={item.memberId} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">{item.memberName}</Typography>
                <Typography
                  variant="body2"
                  color={isPositive ? 'error' : isNegative ? 'success.main' : 'text.secondary'}
                  fontWeight="medium"
                >
                  {isPositive
                    ? `Owes $${balance.toFixed(2)}`
                    : isNegative
                    ? `Owed $${balance.toFixed(2)}`
                    : 'Settled'}
                </Typography>
              </Box>
              {balance > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  color={isPositive ? 'error' : 'success'}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default BalanceVisualization;

