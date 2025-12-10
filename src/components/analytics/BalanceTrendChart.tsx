/**
 * Balance Trend Chart Component
 * 
 * Displays balance trends over time using a line chart
 */

import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { BalanceTrend } from '../../services/balance-analytics.service';

interface BalanceTrendChartProps {
  data: BalanceTrend[];
  groupName?: string;
}

function BalanceTrendChart({ data, groupName }: BalanceTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Balance Trends
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No balance trend data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Balance Trends Over Time
        </Typography>
        {groupName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {groupName}
          </Typography>
        )}
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalOwed"
                stroke="#ef4444"
                strokeWidth={2}
                name="Total Owed"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalOwedTo"
                stroke="#10b981"
                strokeWidth={2}
                name="Total Owed To"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="netBalance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Net Balance"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BalanceTrendChart;
