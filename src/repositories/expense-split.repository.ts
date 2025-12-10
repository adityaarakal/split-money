/**
 * ExpenseSplit Repository
 * 
 * Handles all ExpenseSplit entity operations
 */

import { BaseRepository } from './base.repository';
import { expenseSplitsStore } from '../store/database';
import type { ExpenseSplit } from '../types';
import { validateExpenseSplit } from '../utils/validation/validators';

export class ExpenseSplitRepository extends BaseRepository<ExpenseSplit> {
  constructor() {
    super(expenseSplitsStore);
  }

  /**
   * Create a new expense split with validation
   */
  async create(split: ExpenseSplit): Promise<ExpenseSplit> {
    const validation = validateExpenseSplit(split);
    if (!validation.valid) {
      throw new Error(`Invalid expense split: ${validation.errors.join(', ')}`);
    }
    return super.create(split);
  }

  /**
   * Update expense split with validation
   */
  async update(id: string, updates: Partial<ExpenseSplit>): Promise<ExpenseSplit> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`ExpenseSplit with ID ${id} not found`);
    }
    
    const updated = { ...existing, ...updates, id };
    const validation = validateExpenseSplit(updated);
    if (!validation.valid) {
      throw new Error(`Invalid expense split: ${validation.errors.join(', ')}`);
    }
    
    return super.update(id, updated);
  }

  /**
   * Get all splits for an expense
   */
  async getByExpenseId(expenseId: string): Promise<ExpenseSplit[]> {
    const allSplits = await this.getAll();
    return allSplits.filter((split) => split.expenseId === expenseId);
  }

  /**
   * Get all splits for a member
   */
  async getByMemberId(memberId: string): Promise<ExpenseSplit[]> {
    const allSplits = await this.getAll();
    return allSplits.filter((split) => split.memberId === memberId);
  }

  /**
   * Get unsettled splits
   */
  async getUnsettled(expenseId?: string): Promise<ExpenseSplit[]> {
    const splits = expenseId
      ? await this.getByExpenseId(expenseId)
      : await this.getAll();
    return splits.filter((split) => !split.settled);
  }

  /**
   * Delete all splits for an expense
   */
  async deleteByExpenseId(expenseId: string): Promise<void> {
    const splits = await this.getByExpenseId(expenseId);
    await Promise.all(splits.map((split) => this.delete(split.id)));
  }
}

// Export singleton instance
export const expenseSplitRepository = new ExpenseSplitRepository();



