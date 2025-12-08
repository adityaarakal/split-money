/**
 * IndexedDB Database Configuration
 * 
 * Uses localforage for abstraction over IndexedDB
 * Provides a simple key-value storage interface
 */

import localforage from 'localforage';

// Database configuration
const DB_NAME = 'split-money-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  GROUPS: 'groups',
  MEMBERS: 'members',
  EXPENSES: 'expenses',
  EXPENSE_SPLITS: 'expenseSplits',
} as const;

// Initialize localforage instances for each store
export const groupsStore = localforage.createInstance({
  name: DB_NAME,
  storeName: STORES.GROUPS,
  version: DB_VERSION,
});

export const membersStore = localforage.createInstance({
  name: DB_NAME,
  storeName: STORES.MEMBERS,
  version: DB_VERSION,
});

export const expensesStore = localforage.createInstance({
  name: DB_NAME,
  storeName: STORES.EXPENSES,
  version: DB_VERSION,
});

export const expenseSplitsStore = localforage.createInstance({
  name: DB_NAME,
  storeName: STORES.EXPENSE_SPLITS,
  version: DB_VERSION,
});

/**
 * Initialize database
 * Ensures all stores are ready and runs migrations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await Promise.all([
      groupsStore.ready(),
      membersStore.ready(),
      expensesStore.ready(),
      expenseSplitsStore.ready(),
    ]);
    
    // Run migrations
    const { runMigrations } = await import('./migrations');
    await runMigrations();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
}

/**
 * Clear all data from database
 * Useful for testing or reset functionality
 */
export async function clearDatabase(): Promise<void> {
  try {
    await Promise.all([
      groupsStore.clear(),
      membersStore.clear(),
      expensesStore.clear(),
      expenseSplitsStore.clear(),
    ]);
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw new Error('Database clear failed');
  }
}

