/**
 * Database Storage Tests
 * 
 * Tests for IndexedDB storage operations using localforage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeDatabase,
  clearDatabase,
  groupsStore,
  membersStore,
  expensesStore,
  expenseSplitsStore,
  settlementsStore,
} from './database';

describe('Database Storage', () => {
  beforeEach(async () => {
    // Clear all stores before each test
    await clearDatabase();
  });

  describe('initializeDatabase', () => {
    it('should initialize all stores successfully', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should make all stores ready', async () => {
      await initializeDatabase();
      
      // All stores should be ready
      await expect(groupsStore.ready()).resolves.not.toThrow();
      await expect(membersStore.ready()).resolves.not.toThrow();
      await expect(expensesStore.ready()).resolves.not.toThrow();
      await expect(expenseSplitsStore.ready()).resolves.not.toThrow();
      await expect(settlementsStore.ready()).resolves.not.toThrow();
    });
  });

  describe('clearDatabase', () => {
    it('should clear all stores', async () => {
      // Add some test data
      await groupsStore.setItem('test-group', { id: 'test-group', name: 'Test' });
      await membersStore.setItem('test-member', { id: 'test-member', name: 'Test' });
      
      // Clear database
      await clearDatabase();
      
      // Verify stores are empty
      const group = await groupsStore.getItem('test-group');
      const member = await membersStore.getItem('test-member');
      
      expect(group).toBeNull();
      expect(member).toBeNull();
    });

    it('should handle clearing empty stores', async () => {
      await expect(clearDatabase()).resolves.not.toThrow();
    });
  });

  describe('Store Operations', () => {
    beforeEach(async () => {
      await initializeDatabase();
    });

    describe('groupsStore', () => {
      it('should store and retrieve group data', async () => {
        const group = {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await groupsStore.setItem(group.id, group);
        const retrieved = await groupsStore.getItem(group.id);

        expect(retrieved).toEqual(group);
      });

      it('should remove group data', async () => {
        const group = {
          id: 'group-1',
          name: 'Test Group',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await groupsStore.setItem(group.id, group);
        await groupsStore.removeItem(group.id);
        const retrieved = await groupsStore.getItem(group.id);

        expect(retrieved).toBeNull();
      });
    });

    describe('membersStore', () => {
      it('should store and retrieve member data', async () => {
        const member = {
          id: 'member-1',
          groupId: 'group-1',
          name: 'Test Member',
          email: 'test@example.com',
          joinedAt: new Date(),
        };

        await membersStore.setItem(member.id, member);
        const retrieved = await membersStore.getItem(member.id);

        expect(retrieved).toEqual(member);
      });
    });

    describe('expensesStore', () => {
      it('should store and retrieve expense data', async () => {
        const expense = {
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

        await expensesStore.setItem(expense.id, expense);
        const retrieved = await expensesStore.getItem(expense.id);

        expect(retrieved).toEqual(expense);
      });
    });

    describe('expenseSplitsStore', () => {
      it('should store and retrieve expense split data', async () => {
        const split = {
          id: 'split-1',
          expenseId: 'expense-1',
          memberId: 'member-1',
          amount: 50,
          settled: false,
        };

        await expenseSplitsStore.setItem(split.id, split);
        const retrieved = await expenseSplitsStore.getItem(split.id);

        expect(retrieved).toEqual(split);
      });
    });

    describe('settlementsStore', () => {
      it('should store and retrieve settlement data', async () => {
        const settlement = {
          id: 'settlement-1',
          groupId: 'group-1',
          fromMemberId: 'member-1',
          toMemberId: 'member-2',
          amount: 50,
          date: new Date(),
        };

        await settlementsStore.setItem(settlement.id, settlement);
        const retrieved = await settlementsStore.getItem(settlement.id);

        expect(retrieved).toEqual(settlement);
      });
    });
  });
});
