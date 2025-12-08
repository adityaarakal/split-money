/**
 * Core Data Models for Split Money
 * 
 * These models represent the core entities in the expense splitting system.
 * All models use string IDs for consistency and use Date objects for timestamps.
 */

/**
 * Group - Represents an expense group where members share expenses
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Member - Represents a member within a group
 */
export interface Member {
  id: string;
  groupId: string;
  name: string;
  email?: string;
  avatar?: string;
  joinedAt: Date;
}

/**
 * Expense - Represents an expense paid by a member in a group
 */
export interface Expense {
  id: string;
  groupId: string;
  paidBy: string; // memberId
  amount: number;
  description: string;
  category: string;
  date: Date;
  settled: boolean;
  notes?: string; // Optional notes/receipt information
  receiptUrl?: string; // Optional receipt image URL (for future image upload)
  createdAt: Date;
}

/**
 * ExpenseSplit - Represents how an expense is split among members
 */
export interface ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
  percentage?: number; // Optional percentage if split is percentage-based
  settled: boolean;
}

/**
 * Balance - Represents the balance calculation for a member in a group
 * Positive totalOwed = member owes money
 * Negative totalOwed = member is owed money
 */
export interface Balance {
  memberId: string;
  groupId: string;
  totalOwed: number; // positive = owes, negative = owed to
  expenses: Expense[];
}

/**
 * BackupData - Format for backup/restore functionality
 */
export interface BackupData {
  version: string;
  exportedAt: Date;
  groups: Group[];
  members: Member[];
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
}

