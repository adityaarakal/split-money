/**
 * Expense Archiving Utilities
 * 
 * Provides functions for archiving and unarchiving expenses
 */

import type { Expense } from '../types';

/**
 * Archive an expense by marking it as settled
 * In a full implementation, you might have a separate archived flag
 * For now, we'll use the settled flag as a proxy
 */
export function archiveExpense(expense: Expense): Expense {
  return {
    ...expense,
    settled: true,
  };
}

/**
 * Unarchive an expense
 */
export function unarchiveExpense(expense: Expense): Expense {
  return {
    ...expense,
    settled: false,
  };
}

/**
 * Check if expense is archived
 */
export function isExpenseArchived(expense: Expense): boolean {
  return expense.settled;
}



