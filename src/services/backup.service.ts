/**
 * Backup and Restore Service
 * 
 * Handles exporting and importing all application data
 */

import type { BackupData, Group, Member, Expense, ExpenseSplit } from '../types';
import {
  groupRepository,
  memberRepository,
  expenseRepository,
  expenseSplitRepository,
} from '../repositories';
import { clearDatabase } from '../store/database';

/**
 * Export all data to backup format
 */
export async function exportBackup(): Promise<BackupData> {
  try {
    const [groups, members, expenses, expenseSplits] = await Promise.all([
      groupRepository.getAll(),
      memberRepository.getAll(),
      expenseRepository.getAll(),
      expenseSplitRepository.getAll(),
    ]);

    // Convert Date objects to ISO strings for JSON serialization
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date(),
      groups: groups.map((g) => serializeGroupDates(g)),
      members: members.map((m) => serializeMemberDates(m)),
      expenses: expenses.map((e) => serializeExpenseDates(e)),
      expenseSplits: expenseSplits.map((s) => serializeExpenseSplitDates(s)),
    };

    return backup;
  } catch (error) {
    console.error('Error exporting backup:', error);
    throw new Error(`Failed to export backup: ${error}`);
  }
}

/**
 * Import data from backup format
 */
export async function importBackup(backup: BackupData, clearExisting = false): Promise<void> {
  try {
    // Validate backup structure
    if (!backup.version || !backup.exportedAt) {
      throw new Error('Invalid backup format: missing version or exportedAt');
    }

    if (clearExisting) {
      await clearDatabase();
    }

    // Deserialize dates and import data
    const groups = backup.groups.map(deserializeGroupDates);
    const members = backup.members.map(deserializeMemberDates);
    const expenses = backup.expenses.map(deserializeExpenseDates);
    const expenseSplits = backup.expenseSplits.map(deserializeExpenseSplitDates);

    // Import in order: groups -> members -> expenses -> expense splits
    await Promise.all(groups.map((group) => groupRepository.create(group)));
    await Promise.all(members.map((member) => memberRepository.create(member)));
    await Promise.all(expenses.map((expense) => expenseRepository.create(expense)));
    await Promise.all(expenseSplits.map((split) => expenseSplitRepository.create(split)));
  } catch (error) {
    console.error('Error importing backup:', error);
    throw new Error(`Failed to import backup: ${error}`);
  }
}

/**
 * Download backup as JSON file
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `split-money-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading backup:', error);
    throw new Error(`Failed to download backup: ${error}`);
  }
}

/**
 * Load backup from file
 */
export async function loadBackupFromFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const backup = JSON.parse(text) as BackupData;
        resolve(backup);
      } catch (error) {
        reject(new Error(`Failed to parse backup file: ${error}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Serialize Date objects to ISO strings for JSON
 */
function serializeGroupDates(group: Group): Group {
  return {
    ...group,
    createdAt: group.createdAt instanceof Date ? group.createdAt : new Date(group.createdAt),
    updatedAt: group.updatedAt instanceof Date ? group.updatedAt : new Date(group.updatedAt),
  };
}

function serializeMemberDates(member: Member): Member {
  return {
    ...member,
    joinedAt: member.joinedAt instanceof Date ? member.joinedAt : new Date(member.joinedAt),
  };
}

function serializeExpenseDates(expense: Expense): Expense {
  return {
    ...expense,
    date: expense.date instanceof Date ? expense.date : new Date(expense.date),
    createdAt: expense.createdAt instanceof Date ? expense.createdAt : new Date(expense.createdAt),
  };
}

function serializeExpenseSplitDates(split: ExpenseSplit): ExpenseSplit {
  return { ...split };
}

/**
 * Deserialize ISO strings back to Date objects
 */
function deserializeGroupDates(obj: unknown): Group {
  const group = obj as Group;
  return {
    ...group,
    createdAt: group.createdAt instanceof Date ? group.createdAt : new Date(group.createdAt),
    updatedAt: group.updatedAt instanceof Date ? group.updatedAt : new Date(group.updatedAt),
  };
}

function deserializeMemberDates(obj: unknown): Member {
  const member = obj as Member;
  return {
    ...member,
    joinedAt: member.joinedAt instanceof Date ? member.joinedAt : new Date(member.joinedAt),
  };
}

function deserializeExpenseDates(obj: unknown): Expense {
  const expense = obj as Expense;
  return {
    ...expense,
    date: expense.date instanceof Date ? expense.date : new Date(expense.date),
    createdAt: expense.createdAt instanceof Date ? expense.createdAt : new Date(expense.createdAt),
  };
}

function deserializeExpenseSplitDates(obj: unknown): ExpenseSplit {
  return obj as ExpenseSplit;
}

