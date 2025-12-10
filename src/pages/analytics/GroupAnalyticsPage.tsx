import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { groupRepository } from '../../repositories';
import type { Group } from '../../types';
import {
  getCategoryBreakdown,
  getSpendingTrends,
  getMemberSpending,
  getTimeBasedAnalysis,
  type CategoryBreakdown,
  type SpendingTrend,
  type MemberSpending,
  type TimeBasedAnalysis,
} from '../../services/analytics.service';
import {
  generateAndDownloadReport,
  type ReportData,
} from '../../services/report.service';
import {
  getBalanceTrends,
  getBalanceDistribution,
  getBalanceAnalyticsSummary,
  type BalanceTrend,
  type BalanceDistribution,
  type BalanceAnalyticsSummary,
} from '../../services/balance-analytics.service';
import BalanceTrendChart from '../../components/analytics/BalanceTrendChart';
import {
  getDayOfWeekPatterns,
  getCategoryPatterns,
  getAmountRangePatterns,
  type ExpensePattern,
  type CategoryPattern,
} from '../../services/expense-patterns.service';
import CategoryBreakdownChart from '../../components/analytics/CategoryBreakdownChart';
import SpendingTrendChart from '../../components/analytics/SpendingTrendChart';
import MemberSpendingChart from '../../components/analytics/MemberSpendingChart';
import DashboardCustomizationDialog from '../../components/analytics/DashboardCustomizationDialog';
import { getDashboardPreferences } from '../../services/dashboard-preferences.service';

function GroupAnalyticsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [trendDays, setTrendDays] = useState(30);
  const [timePeriod, setTimePeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [dashboardPreferences, setDashboardPreferences] = useState(getDashboardPreferences());

  // Analytics data
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [memberSpending, setMemberSpending] = useState<MemberSpending[]>([]);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeBasedAnalysis[]>([]);
  const [dayPatterns, setDayPatterns] = useState<ExpensePattern[]>([]);
  const [categoryPatterns, setCategoryPatterns] = useState<CategoryPattern[]>([]);
  const [amountRangePatterns, setAmountRangePatterns] = useState<Array<{ range: string; count: number; totalAmount: number }>>([]);
  
  // Balance analytics data
  const [balanceTrends, setBalanceTrends] = useState<BalanceTrend[]>([]);
  const [balanceDistribution, setBalanceDistribution] = useState<BalanceDistribution[]>([]);
  const [balanceSummary, setBalanceSummary] = useState<BalanceAnalyticsSummary | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, trendDays, timePeriod]);

  const loadGroup = async () => {
    if (!groupId) return;
    try {
      const groupData = await groupRepository.getById(groupId);
      setGroup(groupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    }
  };

  const loadAnalytics = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [categories, trends, members, timeData, dayPatternsData, categoryPatternsData, amountRanges, balanceTrendsData, balanceDistData, balanceSummaryData] = await Promise.all([
        getCategoryBreakdown(groupId),
        getSpendingTrends(groupId, trendDays),
        getMemberSpending(groupId),
        getTimeBasedAnalysis(groupId, timePeriod),
        getDayOfWeekPatterns(groupId),
        getCategoryPatterns(groupId),
        getAmountRangePatterns(groupId),
        getBalanceTrends(groupId),
        getBalanceDistribution(groupId),
        getBalanceAnalyticsSummary(groupId),
      ]);
      setCategoryBreakdown(categories);
      setSpendingTrends(trends);
      setMemberSpending(members);
      setTimeAnalysis(timeData);
      setDayPatterns(dayPatternsData);
      setCategoryPatterns(categoryPatternsData);
      setAmountRangePatterns(amountRanges);
      setBalanceTrends(balanceTrendsData);
      setBalanceDistribution(balanceDistData);
      setBalanceSummary(balanceSummaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'text' | 'pdf' = 'csv') => {
    if (!groupId || !group) return;
    
    try {
      const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.expenseCount, 0);
      const totalAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0);
      const memberCount = memberSpending.length;

      const reportData: ReportData = {
        group,
        categoryBreakdown,
        spendingTrends,
        memberSpending,
        timeAnalysis,
        totalExpenses,
        totalAmount,
        memberCount,
        generatedAt: new Date(),
      };

      await generateAndDownloadReport(reportData, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  if (loading && !group) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !group) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groups')}
          sx={{ mt: 2 }}
        >
          Back to Groups
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Analytics
            </Typography>
            {group && (
              <Typography variant="subtitle1" color="text.secondary">
                {group.name}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setCustomizationDialogOpen(true)}
          >
            Customize
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export Report
          </Button>
        </Box>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuItem
            onClick={async () => {
              setExportMenuAnchor(null);
              await handleExportReport('csv');
            }}
          >
            Export as CSV
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setExportMenuAnchor(null);
              await handleExportReport('text');
            }}
          >
            Export as Text
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setExportMenuAnchor(null);
              await handleExportReport('pdf');
            }}
          >
            Export as PDF
          </MenuItem>
        </Menu>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        {dashboardPreferences.widgets.find((w) => w.id === 'category-breakdown')?.visible && (
          <Tab label="Overview" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'category-breakdown')?.visible && (
          <Tab label="Categories" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'spending-trends')?.visible && (
          <Tab label="Trends" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'member-spending')?.visible && (
          <Tab label="Members" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'time-analysis')?.visible && (
          <Tab label="Time Analysis" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'patterns')?.visible && (
          <Tab label="Patterns" />
        )}
        {dashboardPreferences.widgets.find((w) => w.id === 'balance-analytics')?.visible && (
          <Tab label="Balance Analytics" />
        )}
      </Tabs>

      <DashboardCustomizationDialog
        open={customizationDialogOpen}
        onClose={() => setCustomizationDialogOpen(false)}
        onSave={() => setDashboardPreferences(getDashboardPreferences())}
      />

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CategoryBreakdownChart data={categoryBreakdown} groupName={group?.name} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SpendingTrendChart data={spendingTrends} groupName={group?.name} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MemberSpendingChart data={memberSpending} groupName={group?.name} />
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <CategoryBreakdownChart data={categoryBreakdown} groupName={group?.name} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Details
                </Typography>
                {categoryBreakdown.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Category</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                        <th style={{ textAlign: 'right' }}>Expenses</th>
                        <th style={{ textAlign: 'right' }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown.map((item) => (
                        <tr key={item.category}>
                          <td>{item.category}</td>
                          <td style={{ textAlign: 'right' }}>${item.totalAmount.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{item.expenseCount}</td>
                          <td style={{ textAlign: 'right' }}>{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Spending Trends</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={trendDays}
                      label="Time Period"
                      onChange={(e) => setTrendDays(Number(e.target.value))}
                    >
                      <MenuItem value={7}>Last 7 days</MenuItem>
                      <MenuItem value={30}>Last 30 days</MenuItem>
                      <MenuItem value={90}>Last 90 days</MenuItem>
                      <MenuItem value={180}>Last 6 months</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
            <SpendingTrendChart data={spendingTrends} groupName={group?.name} />
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <MemberSpendingChart data={memberSpending} groupName={group?.name} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Member Spending Details
                </Typography>
                {memberSpending.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No member spending data available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Member</th>
                        <th style={{ textAlign: 'right' }}>Total Paid</th>
                        <th style={{ textAlign: 'right' }}>Total Owed</th>
                        <th style={{ textAlign: 'right' }}>Net Amount</th>
                        <th style={{ textAlign: 'right' }}>Expenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberSpending.map((item) => (
                        <tr key={item.memberId}>
                          <td>{item.memberName}</td>
                          <td style={{ textAlign: 'right' }}>${item.totalPaid.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>${item.totalOwed.toFixed(2)}</td>
                          <td
                            style={{
                              textAlign: 'right',
                              color: item.netAmount > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            ${item.netAmount.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right' }}>{item.expenseCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Time-Based Analysis</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={timePeriod}
                      label="Period"
                      onChange={(e) => setTimePeriod(e.target.value as 'monthly' | 'weekly')}
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis by {timePeriod === 'monthly' ? 'Month' : 'Week'}
                </Typography>
                {timeAnalysis.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No time-based analysis data available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Period</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                        <th style={{ textAlign: 'right' }}>Expenses</th>
                        <th style={{ textAlign: 'right' }}>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeAnalysis.map((item) => (
                        <tr key={item.period}>
                          <td>{item.period}</td>
                          <td style={{ textAlign: 'right' }}>${item.totalAmount.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{item.expenseCount}</td>
                          <td style={{ textAlign: 'right' }}>${item.averageAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 5 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Day of Week Patterns
                </Typography>
                {dayPatterns.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No day patterns available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Day</th>
                        <th style={{ textAlign: 'right' }}>Count</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'right' }}>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayPatterns.map((pattern) => (
                        <tr key={pattern.dayOfWeek}>
                          <td>{pattern.dayOfWeek}</td>
                          <td style={{ textAlign: 'right' }}>{pattern.count}</td>
                          <td style={{ textAlign: 'right' }}>${pattern.totalAmount.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>${pattern.averageAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Amount Range Patterns
                </Typography>
                {amountRangePatterns.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No amount range patterns available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Range</th>
                        <th style={{ textAlign: 'right' }}>Count</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amountRangePatterns.map((pattern) => (
                        <tr key={pattern.range}>
                          <td>{pattern.range}</td>
                          <td style={{ textAlign: 'right' }}>{pattern.count}</td>
                          <td style={{ textAlign: 'right' }}>${pattern.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Frequency Patterns
                </Typography>
                {categoryPatterns.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No category patterns available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Category</th>
                        <th style={{ textAlign: 'right' }}>Frequency</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'right' }}>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPatterns.map((pattern) => (
                        <tr key={pattern.category}>
                          <td>{pattern.category}</td>
                          <td style={{ textAlign: 'right' }}>{pattern.frequency}</td>
                          <td style={{ textAlign: 'right' }}>${pattern.totalAmount.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>${pattern.averageAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 6 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <BalanceTrendChart data={balanceTrends} groupName={group?.name} />
          </Grid>
          {balanceSummary && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Balance Summary
                  </Typography>
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Total Owed:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>${balanceSummary.totalOwed.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Total Owed To:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>${balanceSummary.totalOwedTo.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Net Balance:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>${balanceSummary.netBalance.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Members Owing:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>{balanceSummary.membersOwing}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Members Owed:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>{balanceSummary.membersOwed}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Average Owed:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>${balanceSummary.averageOwed.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'left', padding: '8px 0' }}>Average Owed To:</td>
                        <td style={{ textAlign: 'right', padding: '8px 0' }}>${balanceSummary.averageOwedTo.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Balance Distribution
                </Typography>
                {balanceDistribution.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No balance distribution data available
                  </Typography>
                ) : (
                  <Box component="table" sx={{ width: '100%', mt: 2 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Range</th>
                        <th style={{ textAlign: 'right' }}>Members</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceDistribution.map((item) => (
                        <tr key={item.range}>
                          <td>{item.range}</td>
                          <td style={{ textAlign: 'right' }}>{item.memberCount}</td>
                          <td style={{ textAlign: 'right' }}>${item.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default GroupAnalyticsPage;

