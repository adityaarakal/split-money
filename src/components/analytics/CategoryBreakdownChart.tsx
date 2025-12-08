import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Card, CardContent, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import type { CategoryBreakdown } from '../../services/analytics.service';
import { downloadCSV } from '../../services/balance-export.service';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  groupName?: string;
}

const COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#fa709a',
  '#fee140',
  '#30cfd0',
  '#a8edea',
];

function CategoryBreakdownChart({ data, groupName }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No category data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.totalAmount,
    percentage: item.percentage.toFixed(1),
  }));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Category Breakdown
          </Typography>
          {data.length > 0 && (
            <MuiTooltip title="Export chart data as CSV">
              <IconButton
                size="small"
                onClick={() => {
                  const csv = [
                    'Category,Total Amount,Expense Count,Percentage',
                    ...data.map((item) =>
                      `${item.category},${item.totalAmount.toFixed(2)},${item.expenseCount},${item.percentage.toFixed(2)}`
                    ),
                  ].join('\n');
                  downloadCSV(csv, `category-breakdown-${groupName || 'group'}-${Date.now()}.csv`);
                }}
              >
                <DownloadIcon />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => {
                  const total = chartData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CategoryBreakdownChart;

