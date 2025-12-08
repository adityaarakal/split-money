import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Card, CardContent, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import type { SpendingTrend } from '../../services/analytics.service';
import { downloadCSV } from '../../services/balance-export.service';

interface SpendingTrendChartProps {
  data: SpendingTrend[];
  groupName?: string;
}

function SpendingTrendChart({ data, groupName }: SpendingTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No spending trend data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), 'MMM dd'),
    amount: item.totalAmount,
    count: item.expenseCount,
  }));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Spending Trends
          </Typography>
          {data.length > 0 && (
            <MuiTooltip title="Export chart data as CSV">
              <IconButton
                size="small"
                onClick={() => {
                  const csv = [
                    'Date,Total Amount,Expense Count',
                    ...data.map((item) => `${item.date},${item.totalAmount.toFixed(2)},${item.expenseCount}`),
                  ].join('\n');
                  downloadCSV(csv, `spending-trends-${groupName || 'group'}-${Date.now()}.csv`);
                }}
              >
                <DownloadIcon />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#667eea"
                strokeWidth={2}
                name="Total Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SpendingTrendChart;

