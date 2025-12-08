/**
 * Expense Repository
 * 
 * Handles all Expense entity operations
 */

import { BaseRepository } from './base.repository';
import { expensesStore } from '../store/database';
import type { Expense } from '../types';
import { validateExpense } from '../utils/validation/validators';

export class ExpenseRepository extends BaseRepository<Expense> {
  constructor() {
    super(expensesStore);
  }

  /**
   * Create a new expense with validation
   */
  async create(expense: Expense): Promise<Expense> {
    const validation = validateExpense(expense);
    if (!validation.valid) {
      throw new Error(`Invalid expense: ${validation.errors.join(', ')}`);
    }
    return super.create(expense);
  }

  /**
   * Update expense with validation
   */
  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Expense with ID ${id} not found`);
    }
    
    const updated = { ...existing, ...updates, id };
    const validation = validateExpense(updated);
    if (!validation.valid) {
      throw new Error(`Invalid expense: ${validation.errors.join(', ')}`);
    }
    
    return super.update(id, updated);
  }

  /**
   * Get all expenses in a group
   */
  async getByGroupId(groupId: string): Promise<Expense[]> {
    const allExpenses = await this.getAll();
    return allExpenses.filter((expense) => expense.groupId === groupId);
  }

  /**
   * Get expenses by member (paid by)
   */
  async getByPaidBy(memberId: string): Promise<Expense[]> {
    const allExpenses = await this.getAll();
    return allExpenses.filter((expense) => expense.paidBy === memberId);
  }

  /**
   * Get expenses in date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const allExpenses = await this.getAll();
    return allExpenses.filter((expense) => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  /**
   * Get unsettled expenses
   */
  async getUnsettled(groupId?: string): Promise<Expense[]> {
    const expenses = groupId ? await this.getByGroupId(groupId) : await this.getAll();
    return expenses.filter((expense) => !expense.settled);
  }
}

// Export singleton instance
export const expenseRepository = new ExpenseRepository();


