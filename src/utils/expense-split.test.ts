/**
 * Expense Split Calculation Tests
 * 
 * Tests for expense splitting utilities (equal, custom, percentage)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEqualSplit,
  calculateCustomSplit,
  calculatePercentageSplit,
  validateSplits,
} from './expense-split';
import type { ExpenseSplit } from '../types';

describe('Expense Split Calculations', () => {
  describe('calculateEqualSplit', () => {
    it('should split expense equally among members', () => {
      const expenseAmount = 100;
      const memberIds = ['member-1', 'member-2', 'member-3'];
      const expenseId = 'expense-1';

      const result = calculateEqualSplit(expenseAmount, memberIds, expenseId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.splits).toHaveLength(3);
      expect(result.total).toBeCloseTo(100, 2);

      // Each member should have approximately 33.33
      result.splits.forEach((split) => {
        expect(split.amount).toBeGreaterThan(33);
        expect(split.amount).toBeLessThan(34);
        expect(split.expenseId).toBe(expenseId);
        expect(split.settled).toBe(false);
      });
    });

    it('should handle single member split', () => {
      const expenseAmount = 100;
      const memberIds = ['member-1'];
      const expenseId = 'expense-1';

      const result = calculateEqualSplit(expenseAmount, memberIds, expenseId);

      expect(result.isValid).toBe(true);
      expect(result.splits).toHaveLength(1);
      expect(result.splits[0].amount).toBe(100);
      expect(result.total).toBe(100);
    });

    it('should handle rounding differences correctly', () => {
      const expenseAmount = 100;
      const memberIds = ['member-1', 'member-2', 'member-3'];
      const expenseId = 'expense-1';

      const result = calculateEqualSplit(expenseAmount, memberIds, expenseId);

      expect(result.total).toBeCloseTo(expenseAmount, 2);
      const sum = result.splits.reduce((sum, split) => sum + split.amount, 0);
      expect(sum).toBeCloseTo(expenseAmount, 2);
    });

    it('should reject empty member list', () => {
      const expenseAmount = 100;
      const memberIds: string[] = [];
      const expenseId = 'expense-1';

      const result = calculateEqualSplit(expenseAmount, memberIds, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one member must be selected');
      expect(result.splits).toHaveLength(0);
    });

    it('should handle amounts that do not divide evenly', () => {
      const expenseAmount = 100;
      const memberIds = ['member-1', 'member-2', 'member-3'];
      const expenseId = 'expense-1';

      const result = calculateEqualSplit(expenseAmount, memberIds, expenseId);

      expect(result.isValid).toBe(true);
      const sum = result.splits.reduce((sum, split) => sum + split.amount, 0);
      expect(sum).toBeCloseTo(expenseAmount, 2);
    });
  });

  describe('calculateCustomSplit', () => {
    it('should split expense using custom amounts', () => {
      const expenseAmount = 100;
      const customAmounts = {
        'member-1': 40,
        'member-2': 35,
        'member-3': 25,
      };
      const expenseId = 'expense-1';

      const result = calculateCustomSplit(expenseAmount, customAmounts, expenseId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.splits).toHaveLength(3);
      expect(result.total).toBe(100);

      expect(result.splits.find((s) => s.memberId === 'member-1')?.amount).toBe(40);
      expect(result.splits.find((s) => s.memberId === 'member-2')?.amount).toBe(35);
      expect(result.splits.find((s) => s.memberId === 'member-3')?.amount).toBe(25);
    });

    it('should reject custom amounts that do not sum to expense amount', () => {
      const expenseAmount = 100;
      const customAmounts = {
        'member-1': 40,
        'member-2': 35,
        'member-3': 20, // Total = 95, not 100
      };
      const expenseId = 'expense-1';

      const result = calculateCustomSplit(expenseAmount, customAmounts, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject negative custom amounts', () => {
      const expenseAmount = 100;
      const customAmounts = {
        'member-1': 50,
        'member-2': -10,
        'member-3': 60,
      };
      const expenseId = 'expense-1';

      const result = calculateCustomSplit(expenseAmount, customAmounts, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount for member member-2 cannot be negative');
    });

    it('should allow small floating point differences', () => {
      const expenseAmount = 100;
      const customAmounts = {
        'member-1': 33.33,
        'member-2': 33.33,
        'member-3': 33.34,
      };
      const expenseId = 'expense-1';

      const result = calculateCustomSplit(expenseAmount, customAmounts, expenseId);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculatePercentageSplit', () => {
    it('should split expense using percentages', () => {
      const expenseAmount = 100;
      const percentages = {
        'member-1': 50,
        'member-2': 30,
        'member-3': 20,
      };
      const expenseId = 'expense-1';

      const result = calculatePercentageSplit(expenseAmount, percentages, expenseId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.splits).toHaveLength(3);
      expect(result.total).toBeCloseTo(100, 2);

      expect(result.splits.find((s) => s.memberId === 'member-1')?.amount).toBeCloseTo(50, 2);
      expect(result.splits.find((s) => s.memberId === 'member-2')?.amount).toBeCloseTo(30, 2);
      expect(result.splits.find((s) => s.memberId === 'member-3')?.amount).toBeCloseTo(20, 2);

      // Check percentages are stored
      expect(result.splits.find((s) => s.memberId === 'member-1')?.percentage).toBe(50);
      expect(result.splits.find((s) => s.memberId === 'member-2')?.percentage).toBe(30);
      expect(result.splits.find((s) => s.memberId === 'member-3')?.percentage).toBe(20);
    });

    it('should reject percentages that do not sum to 100', () => {
      const expenseAmount = 100;
      const percentages = {
        'member-1': 50,
        'member-2': 30,
        'member-3': 15, // Total = 95%
      };
      const expenseId = 'expense-1';

      const result = calculatePercentageSplit(expenseAmount, percentages, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Percentages must sum to 100%');
    });

    it('should reject negative percentages', () => {
      const expenseAmount = 100;
      const percentages = {
        'member-1': 50,
        'member-2': -10,
        'member-3': 60,
      };
      const expenseId = 'expense-1';

      const result = calculatePercentageSplit(expenseAmount, percentages, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Percentage for member member-2 must be between 0 and 100');
    });

    it('should reject percentages greater than 100', () => {
      const expenseAmount = 100;
      const percentages = {
        'member-1': 50,
        'member-2': 150, // Individual percentage > 100
      };
      const expenseId = 'expense-1';

      const result = calculatePercentageSplit(expenseAmount, percentages, expenseId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Percentage for member member-2 must be between 0 and 100');
    });

    it('should handle rounding differences correctly', () => {
      const expenseAmount = 100;
      const percentages = {
        'member-1': 33.33,
        'member-2': 33.33,
        'member-3': 33.34,
      };
      const expenseId = 'expense-1';

      const result = calculatePercentageSplit(expenseAmount, percentages, expenseId);

      expect(result.isValid).toBe(true);
      expect(result.total).toBeCloseTo(100, 2);
    });
  });

  describe('validateSplits', () => {
    it('should validate splits that sum to expense amount', () => {
      const expenseAmount = 100;
      const splits: ExpenseSplit[] = [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: 50,
          settled: false,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          memberId: 'member-2',
          amount: 50,
          settled: false,
        },
      ];

      const result = validateSplits(expenseAmount, splits);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject splits that do not sum to expense amount', () => {
      const expenseAmount = 100;
      const splits: ExpenseSplit[] = [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: 30,
          settled: false,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          memberId: 'member-2',
          amount: 50,
          settled: false,
        },
      ];

      const result = validateSplits(expenseAmount, splits);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject splits with negative amounts', () => {
      const expenseAmount = 100;
      const splits: ExpenseSplit[] = [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: -50,
          settled: false,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          memberId: 'member-2',
          amount: 150,
          settled: false,
        },
      ];

      const result = validateSplits(expenseAmount, splits);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Split amount for member member-1 cannot be negative');
    });

    it('should reject splits with invalid percentages', () => {
      const expenseAmount = 100;
      const splits: ExpenseSplit[] = [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: 50,
          percentage: 150,
          settled: false,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          memberId: 'member-2',
          amount: 50,
          settled: false,
        },
      ];

      const result = validateSplits(expenseAmount, splits);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Split percentage for member member-1 must be between 0 and 100');
    });
  });
});
