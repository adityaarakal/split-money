/**
 * Group Comparison Page
 * 
 * Allows users to compare spending across multiple groups
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import { groupRepository } from '../../repositories';
import type { Group } from '../../types';
import { compareGroups, getComparisonSummary, type GroupComparison, type ComparisonSummary } from '../../services/group-comparison.service';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/common';

function GroupComparisonPage() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<GroupComparison[]>([]);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const allGroups = await groupRepository.getAll();
      setGroups(allGroups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load groups';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroupIds(newSelected);
  };

  const handleCompare = async () => {
    if (selectedGroupIds.size < 2) {
      showError('Please select at least 2 groups to compare');
      return;
    }

    try {
      setComparing(true);
      setError(null);
      const groupIdsArray = Array.from(selectedGroupIds);
      const comparisonResults = await compareGroups(groupIdsArray);
      const summaryResult = getComparisonSummary(comparisonResults);
      setComparisons(comparisonResults);
      setSummary(summaryResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare groups';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groups')}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            <CompareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Group Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare spending across multiple groups
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {groups.length === 0 ? (
        <EmptyState
          title="No groups available"
          description="Create some groups first to compare them"
          actionLabel="Create Group"
          onAction={() => navigate('/groups')}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Groups to Compare
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select at least 2 groups
                </Typography>
                <FormGroup>
                  {groups.map((group) => (
                    <FormControlLabel
                      key={group.id}
                      control={
                        <Checkbox
                          checked={selectedGroupIds.has(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                        />
                      }
                      label={group.name}
                    />
                  ))}
                </FormGroup>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCompare}
                  disabled={selectedGroupIds.size < 2 || comparing}
                  sx={{ mt: 2 }}
                >
                  {comparing ? <CircularProgress size={24} /> : 'Compare Groups'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            {summary && comparisons.length > 0 && (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Comparison Summary
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Groups
                        </Typography>
                        <Typography variant="h6">{summary.totalGroups}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6">${summary.totalAmount.toFixed(2)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Expenses
                        </Typography>
                        <Typography variant="h6">{summary.totalExpenses}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Avg per Group
                        </Typography>
                        <Typography variant="h6">${summary.averagePerGroup.toFixed(2)}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Group</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="right">Expenses</TableCell>
                        <TableCell align="right">Members</TableCell>
                        <TableCell align="right">Avg/Member</TableCell>
                        <TableCell align="right">Avg/Expense</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisons.map((comp) => (
                        <TableRow key={comp.groupId}>
                          <TableCell>{comp.groupName}</TableCell>
                          <TableCell align="right">${comp.totalAmount.toFixed(2)}</TableCell>
                          <TableCell align="right">{comp.expenseCount}</TableCell>
                          <TableCell align="right">{comp.memberCount}</TableCell>
                          <TableCell align="right">${comp.averagePerMember.toFixed(2)}</TableCell>
                          <TableCell align="right">${comp.averagePerExpense.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default GroupComparisonPage;
