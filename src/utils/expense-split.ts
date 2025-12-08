/**
 * Expense Splitting Utilities
 * 
 * Provides functions for splitting expenses among members
 */

import type { ExpenseSplit } from '../types';

export type SplitType = 'equal' | 'custom' | 'percentage';

export interface SplitResult {
  splits: ExpenseSplit[];
  total: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Calculate equal split among selected members
 */
export function calculateEqualSplit(
  expenseAmount: number,
  memberIds: string[],
  expenseId: string
): SplitResult {
  if (memberIds.length === 0) {
    return {
      splits: [],
      total: 0,
      isValid: false,
      errors: ['At least one member must be selected'],
    };
  }

  const amountPerMember = expenseAmount / memberIds.length;
  const splits: ExpenseSplit[] = memberIds.map((memberId) => ({
    id: `${expenseId}-${memberId}`,
    expenseId,
    memberId,
    amount: amountPerMember,
    settled: false,
  }));

  // Handle rounding differences
  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const difference = expenseAmount - total;
  if (Math.abs(difference) > 0.01) {
    // Add difference to first split
    splits[0].amount += difference;
  }

  return {
    splits,
    total: expenseAmount,
    isValid: true,
    errors: [],
  };
}

/**
 * Calculate custom amount split
 */
export function calculateCustomSplit(
  expenseAmount: number,
  customAmounts: Record<string, number>,
  expenseId: string
): SplitResult {
  const errors: string[] = [];
  const splits: ExpenseSplit[] = [];

  let total = 0;
  for (const [memberId, amount] of Object.entries(customAmounts)) {
    if (amount < 0) {
      errors.push(`Amount for member ${memberId} cannot be negative`);
      continue;
    }
    splits.push({
      id: `${expenseId}-${memberId}`,
      expenseId,
      memberId,
      amount,
      settled: false,
    });
    total += amount;
  }

  const tolerance = 0.01;
  const difference = Math.abs(expenseAmount - total);
  const isValid = difference <= tolerance && errors.length === 0;

  if (difference > tolerance) {
    errors.push(
      `Custom amounts total (${total.toFixed(2)}) does not match expense amount (${expenseAmount.toFixed(2)})`
    );
  }

  return {
    splits,
    total,
    isValid,
    errors,
  };
}

/**
 * Calculate percentage split
 */
export function calculatePercentageSplit(
  expenseAmount: number,
  percentages: Record<string, number>,
  expenseId: string
): SplitResult {
  const errors: string[] = [];
  const splits: ExpenseSplit[] = [];

  let totalPercentage = 0;
  for (const [memberId, percentage] of Object.entries(percentages)) {
    if (percentage < 0 || percentage > 100) {
      errors.push(`Percentage for member ${memberId} must be between 0 and 100`);
      continue;
    }
    totalPercentage += percentage;
  }

  if (Math.abs(totalPercentage - 100) > 0.01) {
    errors.push(`Percentages must sum to 100% (current: ${totalPercentage.toFixed(2)}%)`);
  }

  if (errors.length > 0) {
    return {
      splits: [],
      total: 0,
      isValid: false,
      errors,
    };
  }

  let total = 0;
  for (const [memberId, percentage] of Object.entries(percentages)) {
    const amount = (expenseAmount * percentage) / 100;
    splits.push({
      id: `${expenseId}-${memberId}`,
      expenseId,
      memberId,
      amount,
      percentage,
      settled: false,
    });
    total += amount;
  }

  // Handle rounding differences
  const difference = expenseAmount - total;
  if (Math.abs(difference) > 0.01) {
    splits[0].amount += difference;
    total = expenseAmount;
  }

  return {
    splits,
    total,
    isValid: true,
    errors: [],
  };
}

/**
 * Validate expense splits
 */
export function validateSplits(
  expenseAmount: number,
  splits: ExpenseSplit[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const tolerance = 0.01;

  if (Math.abs(total - expenseAmount) > tolerance) {
    errors.push(
      `Splits total (${total.toFixed(2)}) does not match expense amount (${expenseAmount.toFixed(2)})`
    );
  }

  for (const split of splits) {
    if (split.amount < 0) {
      errors.push(`Split amount for member ${split.memberId} cannot be negative`);
    }
    if (split.percentage !== undefined && (split.percentage < 0 || split.percentage > 100)) {
      errors.push(`Split percentage for member ${split.memberId} must be between 0 and 100`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

