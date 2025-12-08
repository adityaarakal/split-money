import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import type { Expense, Member } from '../../types';
import { format } from 'date-fns';
import ExpenseCard from './ExpenseCard';

export type ExpenseSortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category';
export type ExpenseFilter = {
  category?: string;
  memberId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  settled?: boolean;
};

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onExpenseClick: (expense: Expense) => void;
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (expense: Expense) => void;
  onExpenseDuplicate: (expense: Expense) => void;
  onExpenseArchive?: (expense: Expense) => void;
  onExpenseUnarchive?: (expense: Expense) => void;
}

function ExpenseList({
  expenses,
  members,
  onExpenseClick,
  onExpenseEdit,
  onExpenseDelete,
  onExpenseDuplicate,
  onExpenseArchive,
  onExpenseUnarchive,
}: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<ExpenseSortOption>('date-desc');
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  const categories = Array.from(new Set(expenses.map((e) => e.category)));

  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesDescription = expense.description.toLowerCase().includes(searchLower);
        const matchesCategory = expense.category.toLowerCase().includes(searchLower);
        const paidByMember = members.find((m) => m.id === expense.paidBy);
        const matchesMember = paidByMember?.name.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesCategory && !matchesMember) {
          return false;
        }
      }

      // Category filter
      if (filter.category && expense.category !== filter.category) {
        return false;
      }

      // Member filter
      if (filter.memberId && expense.paidBy !== filter.memberId) {
        return false;
      }

      // Date filters
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      if (filter.dateFrom && expenseDate < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && expenseDate > filter.dateTo) {
        return false;
      }

      // Settled filter
      if (filter.settled !== undefined && expense.settled !== filter.settled) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        }
        case 'date-asc': {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        }
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [expenses, searchTerm, filter, sortBy, members]);

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filteredAndSortedExpenses.forEach((expense) => {
      const date = expense.date instanceof Date ? expense.date : new Date(expense.date);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    return groups;
  }, [filteredAndSortedExpenses]);

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchTerm.length > 0;

  return (
    <Box>
      <Box display="flex" gap={2} sx={{ mb: 3 }} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          fullWidth
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box display="flex" gap={1}>
          <IconButton
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            color={hasActiveFilters ? 'primary' : 'default'}
          >
            <FilterIcon />
          </IconButton>
          <IconButton onClick={(e) => setSortMenuAnchor(e.currentTarget)}>
            <SortIcon />
          </IconButton>
        </Box>
      </Box>

      {hasActiveFilters && (
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {filter.category && (
            <Chip
              label={`Category: ${filter.category}`}
              onDelete={() => setFilter({ ...filter, category: undefined })}
              size="small"
            />
          )}
          {filter.memberId && (
            <Chip
              label={`Member: ${members.find((m) => m.id === filter.memberId)?.name || 'Unknown'}`}
              onDelete={() => setFilter({ ...filter, memberId: undefined })}
              size="small"
            />
          )}
          {filter.settled !== undefined && (
            <Chip
              label={filter.settled ? 'Settled' : 'Unsettled'}
              onDelete={() => setFilter({ ...filter, settled: undefined })}
              size="small"
            />
          )}
          <Chip label="Clear all" onClick={clearFilters} size="small" color="primary" />
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Paid By</InputLabel>
            <Select
              value={filter.memberId || ''}
              onChange={(e) => setFilter({ ...filter, memberId: e.target.value || undefined })}
              label="Paid By"
            >
              <MenuItem value="">All</MenuItem>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.settled === undefined ? 'all' : filter.settled ? 'settled' : 'unsettled'}
              onChange={(e) => {
                const value = e.target.value as string;
                setFilter({
                  ...filter,
                  settled: value === 'all' ? undefined : value === 'settled',
                });
              }}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="settled">Settled</MenuItem>
              <MenuItem value="unsettled">Unsettled</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('date-desc'); setSortMenuAnchor(null); }}>
          <ListItemText primary="Date (Newest First)" />
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('date-asc'); setSortMenuAnchor(null); }}>
          <ListItemText primary="Date (Oldest First)" />
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('amount-desc'); setSortMenuAnchor(null); }}>
          <ListItemText primary="Amount (High to Low)" />
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('amount-asc'); setSortMenuAnchor(null); }}>
          <ListItemText primary="Amount (Low to High)" />
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('category'); setSortMenuAnchor(null); }}>
          <ListItemText primary="Category" />
        </MenuItem>
      </Menu>

      {filteredAndSortedExpenses.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            {hasActiveFilters ? 'No expenses match your filters' : 'No expenses yet'}
          </Typography>
        </Box>
      ) : (
        <Box>
          {Object.entries(groupedExpenses)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([dateKey, dateExpenses]) => (
              <Box key={dateKey} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {format(new Date(dateKey), 'MMMM dd, yyyy')}
                </Typography>
                {dateExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    members={members}
                    onClick={() => onExpenseClick(expense)}
                    onEdit={() => onExpenseEdit(expense)}
                    onDelete={() => onExpenseDelete(expense)}
                    onDuplicate={() => onExpenseDuplicate(expense)}
                    onArchive={onExpenseArchive ? () => onExpenseArchive(expense) : undefined}
                    onUnarchive={onExpenseUnarchive ? () => onExpenseUnarchive(expense) : undefined}
                  />
                ))}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}

export default ExpenseList;

