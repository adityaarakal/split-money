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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { groupRepository, memberRepository, expenseRepository, expenseSplitRepository } from '../../repositories';
import type { Group, Member, Expense, ExpenseSplit } from '../../types';
import { generateId } from '../../utils/id';
import MembersList from '../../components/members/MembersList';
import EditMemberDialog from '../../components/members/EditMemberDialog';
import CreateExpenseDialog from '../../components/expenses/CreateExpenseDialog';
import ExpenseDetailDialog from '../../components/expenses/ExpenseDetailDialog';
import EditExpenseDialog from '../../components/expenses/EditExpenseDialog';
import ExpenseList from '../../components/expenses/ExpenseList';
import CategoryManagementDialog from '../../components/expenses/CategoryManagementDialog';
import ExpenseTemplateDialog from '../../components/expenses/ExpenseTemplateDialog';
import SaveTemplateDialog from '../../components/expenses/SaveTemplateDialog';
import BalanceSummary from '../../components/balances/BalanceSummary';
import SettlementDialog from '../../components/settlements/SettlementDialog';
import SettlementHistory from '../../components/settlements/SettlementHistory';
import { clearBalanceCache } from '../../services/balance-optimization.service';
import type { Debt } from '../../services/balance-optimization.service';

function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSplits, setExpenseSplits] = useState<Record<string, ExpenseSplit[]>>({});
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseDetailOpen, setExpenseDetailOpen] = useState(false);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadMembers();
      loadExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const groupData = await groupRepository.getById(groupId);
      if (!groupData) {
        setError('Group not found');
        return;
      }
      setGroup(groupData);
      setEditName(groupData.name);
      setEditDescription(groupData.description || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!groupId) return;
    try {
      const groupMembers = await memberRepository.getByGroupId(groupId);
      setMembers(groupMembers);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const loadExpenses = async () => {
    if (!groupId) return;
    try {
      const groupExpenses = await expenseRepository.getByGroupId(groupId);
      setExpenses(groupExpenses);
      
      // Load splits for all expenses
      const splitsMap: Record<string, ExpenseSplit[]> = {};
      await Promise.all(
        groupExpenses.map(async (expense) => {
          const splits = await expenseSplitRepository.getByExpenseId(expense.id);
          splitsMap[expense.id] = splits;
        })
      );
      setExpenseSplits(splitsMap);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  };

  const handleCreateExpense = async (expense: Expense, splits: ExpenseSplit[]) => {
    await expenseRepository.create(expense);
    await Promise.all(splits.map((split) => expenseSplitRepository.create(split)));
    await loadExpenses();
  };

  const handleUpdateExpense = async (expense: Expense, splits: ExpenseSplit[]) => {
    // Delete old splits
    const oldSplits = expenseSplits[expense.id] || [];
    await Promise.all(oldSplits.map((split) => expenseSplitRepository.delete(split.id)));
    
    // Update expense
    await expenseRepository.update(expense.id, expense);
    
    // Create new splits
    await Promise.all(splits.map((split) => expenseSplitRepository.create(split)));
    
    await loadExpenses();
    setEditExpenseDialogOpen(false);
    setExpenseDetailOpen(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      // Delete splits first
      const splits = expenseSplits[expenseId] || [];
      await Promise.all(splits.map((split) => expenseSplitRepository.delete(split.id)));
      
      // Delete expense
      await expenseRepository.delete(expenseId);
      await loadExpenses();
      setExpenseDetailOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  const handleDuplicateExpense = async (expense: Expense) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: generateId(),
        description: `${expense.description} (Copy)`,
        createdAt: new Date(),
      };
      
      const oldSplits = expenseSplits[expense.id] || [];
      const newSplits: ExpenseSplit[] = oldSplits.map((split) => ({
        ...split,
        id: `${newExpense.id}-${split.memberId}`,
        expenseId: newExpense.id,
      }));
      
      await handleCreateExpense(newExpense, newSplits);
      setExpenseDetailOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate expense');
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseDetailOpen(true);
  };

  const handleExpenseEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseDetailOpen(false);
    setEditExpenseDialogOpen(true);
  };

  const handleArchiveExpense = async (expense: Expense) => {
    try {
      await expenseRepository.update(expense.id, { settled: true });
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive expense');
    }
  };

  const handleUnarchiveExpense = async (expense: Expense) => {
    try {
      await expenseRepository.update(expense.id, { settled: false });
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive expense');
    }
  };

  const handleUpdateGroup = async () => {
    if (!group || !editName.trim()) return;
    try {
      await groupRepository.update(group.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      await loadGroup();
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    try {
      await groupRepository.delete(group.id);
      navigate('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const handleAddMember = async (name: string, email?: string) => {
    if (!groupId || !name.trim()) return;
    const newMember: Member = {
      id: generateId(),
      groupId,
      name: name.trim(),
      email: email?.trim() || undefined,
      joinedAt: new Date(),
    };
    await memberRepository.create(newMember);
    await loadMembers();
    setAddMemberDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !group) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groups')}
          sx={{ mt: 2 }}
        >
          Back to Groups
        </Button>
      </Container>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate('/groups')}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {group.name}
          </Typography>
          {group.description && (
            <Typography variant="body1" color="text.secondary" mt={1}>
              {group.description}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteGroup}
        >
          Delete
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Balance Summary */}
      {groupId && members.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <BalanceSummary
              groupId={groupId}
              members={members}
              groupName={group?.name}
              onSettle={(debt) => {
                setSelectedDebt(debt);
                setSettlementDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Members ({members.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMemberDialogOpen(true)}
            >
              Add Member
            </Button>
          </Box>
          <MembersList
            members={members}
            onMemberDelete={async (memberId) => {
              await memberRepository.delete(memberId);
              await loadMembers();
            }}
            onMemberEdit={(member) => {
              setSelectedMember(member);
              setEditMemberDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Expenses ({expenses.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddExpenseDialogOpen(true)}
              disabled={members.length === 0}
            >
              Add Expense
            </Button>
          </Box>
          {expenses.length === 0 ? (
            <Box
              textAlign="center"
              py={4}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No expenses yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {members.length === 0
                  ? 'Add members first to create expenses'
                  : 'Create your first expense to start tracking'}
              </Typography>
            </Box>
          ) : (
            <ExpenseList
              expenses={expenses}
              members={members}
              onExpenseClick={handleExpenseClick}
              onExpenseEdit={handleExpenseEdit}
              onExpenseDelete={(expense) => handleDeleteExpense(expense.id)}
              onExpenseDuplicate={handleDuplicateExpense}
              onExpenseArchive={handleArchiveExpense}
              onExpenseUnarchive={handleUnarchiveExpense}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateGroup}
            variant="contained"
            disabled={!editName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onAdd={handleAddMember}
      />

      {/* Edit Member Dialog */}
      {selectedMember && (
        <EditMemberDialog
          open={editMemberDialogOpen}
          onClose={() => {
            setEditMemberDialogOpen(false);
            setSelectedMember(null);
          }}
          onUpdate={async (memberId, updates) => {
            await memberRepository.update(memberId, updates);
            await loadMembers();
          }}
          member={selectedMember}
        />
      )}

      {/* Add Expense Dialog */}
      {groupId && (
        <CreateExpenseDialog
          open={addExpenseDialogOpen}
          onClose={() => setAddExpenseDialogOpen(false)}
          onCreate={handleCreateExpense}
          groupId={groupId}
          members={members}
        />
      )}

      {/* Expense Detail Dialog */}
      {selectedExpense && (
        <ExpenseDetailDialog
          open={expenseDetailOpen}
          onClose={() => {
            setExpenseDetailOpen(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          splits={expenseSplits[selectedExpense.id] || []}
          members={members}
          onEdit={() => handleExpenseEdit(selectedExpense)}
          onDelete={() => handleDeleteExpense(selectedExpense.id)}
          onDuplicate={() => handleDuplicateExpense(selectedExpense)}
          onSaveAsTemplate={() => {
            setExpenseDetailOpen(false);
            setSaveTemplateDialogOpen(true);
          }}
        />
      )}

      {/* Edit Expense Dialog */}
      {selectedExpense && (
        <EditExpenseDialog
          open={editExpenseDialogOpen}
          onClose={() => {
            setEditExpenseDialogOpen(false);
            setSelectedExpense(null);
          }}
          onUpdate={handleUpdateExpense}
          expense={selectedExpense}
          existingSplits={expenseSplits[selectedExpense.id] || []}
          members={members}
        />
      )}

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={categoryManagementOpen}
        onClose={() => setCategoryManagementOpen(false)}
      />

      {/* Expense Template Dialog */}
      {groupId && (
        <ExpenseTemplateDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          onUseTemplate={handleCreateExpense}
          groupId={groupId}
          members={members}
        />
      )}

      {/* Save Template Dialog */}
      {selectedExpense && (
        <SaveTemplateDialog
          open={saveTemplateDialogOpen}
          onClose={() => {
            setSaveTemplateDialogOpen(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          splits={expenseSplits[selectedExpense.id] || []}
        />
      )}

      {/* Settlement Dialog */}
      {selectedDebt && groupId && (
        <SettlementDialog
          open={settlementDialogOpen}
          onClose={() => {
            setSettlementDialogOpen(false);
            setSelectedDebt(null);
          }}
          onSettle={() => {
            clearBalanceCache(groupId);
            // Reload expenses to refresh balances
            loadExpenses();
          }}
          groupId={groupId}
          fromMemberId={selectedDebt.fromMemberId}
          fromMemberName={selectedDebt.fromMemberName}
          toMemberId={selectedDebt.toMemberId}
          toMemberName={selectedDebt.toMemberName}
          amount={selectedDebt.amount}
        />
      )}

      {/* Settlement History */}
      {groupId && members.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <SettlementHistory groupId={groupId} groupName={group?.name} members={members} />
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, email?: string) => Promise<void>;
}

function AddMemberDialog({ open, onClose, onAdd }: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Member name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAdd(name.trim(), email.trim() || undefined);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setEmail('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Member</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Member Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Email (Optional)"
          fullWidth
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GroupDetailPage;

