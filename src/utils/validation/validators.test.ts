/**
 * Validation Tests
 * 
 * Tests for data validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateGroup,
  validateMember,
  validateExpense,
  validateExpenseSplit,
  validateExpenseSplitsSum,
} from './validators';
import type { Group, Member, Expense, ExpenseSplit } from '../../types';

describe('Validation Utilities', () => {
  describe('validateGroup', () => {
    it('should validate a valid group', () => {
      const group: Partial<Group> = {
        id: 'group-1',
        name: 'Test Group',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject group without id', () => {
      const group: Partial<Group> = {
        name: 'Test Group',
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group ID is required and must be a non-empty string');
    });

    it('should reject group without name', () => {
      const group: Partial<Group> = {
        id: 'group-1',
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group name is required and must be a non-empty string');
    });

    it('should reject group with empty name', () => {
      const group: Partial<Group> = {
        id: 'group-1',
        name: '   ',
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group name is required and must be a non-empty string');
    });

    it('should reject group with name longer than 100 characters', () => {
      const group: Partial<Group> = {
        id: 'group-1',
        name: 'a'.repeat(101),
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group name must be 100 characters or less');
    });

    it('should reject group with description longer than 500 characters', () => {
      const group: Partial<Group> = {
        id: 'group-1',
        name: 'Test Group',
        description: 'a'.repeat(501),
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group description must be 500 characters or less');
    });

    it('should reject group with invalid createdAt date', () => {
      const group: Partial<Group> = {
        id: 'group-1',
        name: 'Test Group',
        createdAt: 'invalid-date' as unknown as Date, // Invalid date string
      };

      const result = validateGroup(group);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group createdAt must be a valid Date');
    });
  });

  describe('validateMember', () => {
    it('should validate a valid member', () => {
      const member: Partial<Member> = {
        id: 'member-1',
        groupId: 'group-1',
        name: 'Test Member',
        email: 'test@example.com',
        joinedAt: new Date(),
      };

      const result = validateMember(member);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject member without id', () => {
      const member: Partial<Member> = {
        groupId: 'group-1',
        name: 'Test Member',
      };

      const result = validateMember(member);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Member ID is required and must be a non-empty string');
    });

    it('should reject member without groupId', () => {
      const member: Partial<Member> = {
        id: 'member-1',
        name: 'Test Member',
      };

      const result = validateMember(member);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Member groupId is required and must be a non-empty string');
    });

    it('should reject member without name', () => {
      const member: Partial<Member> = {
        id: 'member-1',
        groupId: 'group-1',
      };

      const result = validateMember(member);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Member name is required and must be a non-empty string');
    });

    it('should reject member with invalid email', () => {
      const member: Partial<Member> = {
        id: 'member-1',
        groupId: 'group-1',
        name: 'Test Member',
        email: 'invalid-email',
      };

      const result = validateMember(member);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Member email must be a valid email address');
    });

    it('should accept member without email', () => {
      const member: Partial<Member> = {
        id: 'member-1',
        groupId: 'group-1',
        name: 'Test Member',
        joinedAt: new Date(),
      };

      const result = validateMember(member);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateExpense', () => {
    it('should validate a valid expense', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 100,
        description: 'Test Expense',
        category: 'Food',
        date: new Date(),
        settled: false,
        createdAt: new Date(),
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject expense without id', () => {
      const expense: Partial<Expense> = {
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 100,
        description: 'Test',
        category: 'Food',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense ID is required and must be a non-empty string');
    });

    it('should reject expense with zero amount', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 0,
        description: 'Test',
        category: 'Food',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense amount is required and must be a positive number');
    });

    it('should reject expense with negative amount', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: -100,
        description: 'Test',
        category: 'Food',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense amount is required and must be a positive number');
    });

    it('should reject expense with amount greater than 1,000,000', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 1000001,
        description: 'Test',
        category: 'Food',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense amount must be less than or equal to 1,000,000');
    });

    it('should reject expense without description', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 100,
        category: 'Food',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense description is required and must be a non-empty string');
    });

    it('should reject expense without category', () => {
      const expense: Partial<Expense> = {
        id: 'expense-1',
        groupId: 'group-1',
        paidBy: 'member-1',
        amount: 100,
        description: 'Test',
        date: new Date(),
        settled: false,
      };

      const result = validateExpense(expense);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expense category is required and must be a non-empty string');
    });
  });

  describe('validateExpenseSplit', () => {
    it('should validate a valid expense split', () => {
      const split: Partial<ExpenseSplit> = {
        id: 'split-1',
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: 50,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate expense split with percentage', () => {
      const split: Partial<ExpenseSplit> = {
        id: 'split-1',
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: 50,
        percentage: 50,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(true);
    });

    it('should reject split without id', () => {
      const split: Partial<ExpenseSplit> = {
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: 50,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ExpenseSplit ID is required and must be a non-empty string');
    });

    it('should reject split with negative amount', () => {
      const split: Partial<ExpenseSplit> = {
        id: 'split-1',
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: -50,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ExpenseSplit amount is required and must be a non-negative number');
    });

    it('should reject split with percentage less than 0', () => {
      const split: Partial<ExpenseSplit> = {
        id: 'split-1',
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: 50,
        percentage: -10,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ExpenseSplit percentage must be a number between 0 and 100');
    });

    it('should reject split with percentage greater than 100', () => {
      const split: Partial<ExpenseSplit> = {
        id: 'split-1',
        expenseId: 'expense-1',
        memberId: 'member-1',
        amount: 50,
        percentage: 150,
        settled: false,
      };

      const result = validateExpenseSplit(split);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ExpenseSplit percentage must be a number between 0 and 100');
    });
  });

  describe('validateExpenseSplitsSum', () => {
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

      const result = validateExpenseSplitsSum(expenseAmount, splits);
      expect(result.valid).toBe(true);
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

      const result = validateExpenseSplitsSum(expenseAmount, splits);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should allow small floating point differences within tolerance', () => {
      const expenseAmount = 100;
      const splits: ExpenseSplit[] = [
        {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: 50.005,
          settled: false,
        },
        {
          id: 'split-2',
          expenseId: 'expense-1',
          memberId: 'member-2',
          amount: 49.995,
          settled: false,
        },
      ];

      const result = validateExpenseSplitsSum(expenseAmount, splits);
      expect(result.valid).toBe(true);
    });
  });
});
