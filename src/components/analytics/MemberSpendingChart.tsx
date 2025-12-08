import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Card, CardContent, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import type { MemberSpending } from '../../services/analytics.service';
import { downloadCSV } from '../../services/balance-export.service';

interface MemberSpendingChartProps {
  data: MemberSpending[];
  groupName?: string;
}

function MemberSpendingChart({ data, groupName }: MemberSpendingChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No member spending data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.memberName.length > 10 ? `${item.memberName.substring(0, 10)}...` : item.memberName,
    fullName: item.memberName,
    paid: item.totalPaid,
    owed: item.totalOwed,
    net: item.netAmount,
  }));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Member Spending Analysis
          </Typography>
          {data.length > 0 && (
            <MuiTooltip title="Export chart data as CSV">
              <IconButton
                size="small"
                onClick={() => {
                  const csv = [
                    'Member Name,Total Paid,Total Owed,Net Amount,Expense Count',
                    ...data.map((item) =>
                      `${item.memberName},${item.totalPaid.toFixed(2)},${item.totalOwed.toFixed(2)},${item.netAmount.toFixed(2)},${item.expenseCount}`
                    ),
                  ].join('\n');
                  downloadCSV(csv, `member-spending-${groupName || 'group'}-${Date.now()}.csv`);
                }}
              >
                <DownloadIcon />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'fullName') return null;
                  return `$${value.toFixed(2)}`;
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Legend />
              <Bar dataKey="paid" fill="#667eea" name="Total Paid" />
              <Bar dataKey="owed" fill="#764ba2" name="Total Owed" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default MemberSpendingChart;

