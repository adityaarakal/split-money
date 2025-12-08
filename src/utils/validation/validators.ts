/**
 * Data Validation Utilities
 * 
 * Provides validation functions for all data models
 */

import type { Group, Member, Expense, ExpenseSplit } from '../../types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate Group entity
 */
export function validateGroup(group: Partial<Group>): ValidationResult {
  const errors: string[] = [];

  if (!group.id || typeof group.id !== 'string' || group.id.trim() === '') {
    errors.push('Group ID is required and must be a non-empty string');
  }

  if (!group.name || typeof group.name !== 'string' || group.name.trim() === '') {
    errors.push('Group name is required and must be a non-empty string');
  }

  if (group.name && group.name.length > 100) {
    errors.push('Group name must be 100 characters or less');
  }

  if (group.description && typeof group.description === 'string' && group.description.length > 500) {
    errors.push('Group description must be 500 characters or less');
  }

  if (group.createdAt && !(group.createdAt instanceof Date) && isNaN(new Date(group.createdAt).getTime())) {
    errors.push('Group createdAt must be a valid Date');
  }

  if (group.updatedAt && !(group.updatedAt instanceof Date) && isNaN(new Date(group.updatedAt).getTime())) {
    errors.push('Group updatedAt must be a valid Date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Member entity
 */
export function validateMember(member: Partial<Member>): ValidationResult {
  const errors: string[] = [];

  if (!member.id || typeof member.id !== 'string' || member.id.trim() === '') {
    errors.push('Member ID is required and must be a non-empty string');
  }

  if (!member.groupId || typeof member.groupId !== 'string' || member.groupId.trim() === '') {
    errors.push('Member groupId is required and must be a non-empty string');
  }

  if (!member.name || typeof member.name !== 'string' || member.name.trim() === '') {
    errors.push('Member name is required and must be a non-empty string');
  }

  if (member.name && member.name.length > 100) {
    errors.push('Member name must be 100 characters or less');
  }

  if (member.email && typeof member.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member.email)) {
      errors.push('Member email must be a valid email address');
    }
  }

  if (member.joinedAt && !(member.joinedAt instanceof Date) && isNaN(new Date(member.joinedAt).getTime())) {
    errors.push('Member joinedAt must be a valid Date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Expense entity
 */
export function validateExpense(expense: Partial<Expense>): ValidationResult {
  const errors: string[] = [];

  if (!expense.id || typeof expense.id !== 'string' || expense.id.trim() === '') {
    errors.push('Expense ID is required and must be a non-empty string');
  }

  if (!expense.groupId || typeof expense.groupId !== 'string' || expense.groupId.trim() === '') {
    errors.push('Expense groupId is required and must be a non-empty string');
  }

  if (!expense.paidBy || typeof expense.paidBy !== 'string' || expense.paidBy.trim() === '') {
    errors.push('Expense paidBy (memberId) is required and must be a non-empty string');
  }

  if (typeof expense.amount !== 'number' || expense.amount <= 0) {
    errors.push('Expense amount is required and must be a positive number');
  }

  if (expense.amount && expense.amount > 1000000) {
    errors.push('Expense amount must be less than or equal to 1,000,000');
  }

  if (!expense.description || typeof expense.description !== 'string' || expense.description.trim() === '') {
    errors.push('Expense description is required and must be a non-empty string');
  }

  if (expense.description && expense.description.length > 500) {
    errors.push('Expense description must be 500 characters or less');
  }

  if (!expense.category || typeof expense.category !== 'string' || expense.category.trim() === '') {
    errors.push('Expense category is required and must be a non-empty string');
  }

  if (expense.date && !(expense.date instanceof Date) && isNaN(new Date(expense.date).getTime())) {
    errors.push('Expense date must be a valid Date');
  }

  if (typeof expense.settled !== 'boolean') {
    errors.push('Expense settled must be a boolean');
  }

  if (expense.createdAt && !(expense.createdAt instanceof Date) && isNaN(new Date(expense.createdAt).getTime())) {
    errors.push('Expense createdAt must be a valid Date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate ExpenseSplit entity
 */
export function validateExpenseSplit(split: Partial<ExpenseSplit>): ValidationResult {
  const errors: string[] = [];

  if (!split.id || typeof split.id !== 'string' || split.id.trim() === '') {
    errors.push('ExpenseSplit ID is required and must be a non-empty string');
  }

  if (!split.expenseId || typeof split.expenseId !== 'string' || split.expenseId.trim() === '') {
    errors.push('ExpenseSplit expenseId is required and must be a non-empty string');
  }

  if (!split.memberId || typeof split.memberId !== 'string' || split.memberId.trim() === '') {
    errors.push('ExpenseSplit memberId is required and must be a non-empty string');
  }

  if (typeof split.amount !== 'number' || split.amount < 0) {
    errors.push('ExpenseSplit amount is required and must be a non-negative number');
  }

  if (split.percentage !== undefined) {
    if (typeof split.percentage !== 'number' || split.percentage < 0 || split.percentage > 100) {
      errors.push('ExpenseSplit percentage must be a number between 0 and 100');
    }
  }

  if (typeof split.settled !== 'boolean') {
    errors.push('ExpenseSplit settled must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that expense splits sum to expense amount
 */
export function validateExpenseSplitsSum(
  expenseAmount: number,
  splits: ExpenseSplit[]
): ValidationResult {
  const errors: string[] = [];
  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  const tolerance = 0.01; // Allow small floating point differences

  if (Math.abs(totalSplit - expenseAmount) > tolerance) {
    errors.push(
      `Expense splits total (${totalSplit}) does not match expense amount (${expenseAmount})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

