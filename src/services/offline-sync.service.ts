/**
 * Offline Sync Service
 * 
 * Handles syncing queued operations when back online
 */

import { getQueuedOperations, removeQueuedOperation, incrementRetry, type QueuedOperation } from './offline-queue.service';
import { groupRepository, memberRepository, expenseRepository, expenseSplitRepository, settlementRepository } from '../repositories';
import type { Group, Member, Expense, ExpenseSplit } from '../types';
import type { Settlement } from '../types/settlement';

/**
 * Process all queued operations
 */
export async function syncQueuedOperations(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ operationId: string; error: string }>;
}> {
  const operations = getQueuedOperations();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ operationId: string; error: string }>,
  };

  for (const operation of operations) {
    try {
      await processOperation(operation);
      removeQueuedOperation(operation.id);
      results.success++;
    } catch (error) {
      const shouldRetry = incrementRetry(operation.id);
      if (!shouldRetry) {
        results.failed++;
        results.errors.push({
          operationId: operation.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return results;
}

/**
 * Process a single queued operation
 */
async function processOperation(operation: QueuedOperation): Promise<void> {
  switch (operation.entity) {
    case 'group':
      await processGroupOperation(operation);
      break;
    case 'member':
      await processMemberOperation(operation);
      break;
    case 'expense':
      await processExpenseOperation(operation);
      break;
    case 'expenseSplit':
      await processExpenseSplitOperation(operation);
      break;
    case 'settlement':
      await processSettlementOperation(operation);
      break;
    default:
      throw new Error(`Unknown entity type: ${operation.entity}`);
  }
}

async function processGroupOperation(operation: QueuedOperation): Promise<void> {
  const data = operation.data as Group;
  
  switch (operation.type) {
    case 'create':
      await groupRepository.create(data);
      break;
    case 'update':
      await groupRepository.update(data.id, data);
      break;
    case 'delete':
      await groupRepository.delete(data.id);
      break;
  }
}

async function processMemberOperation(operation: QueuedOperation): Promise<void> {
  const data = operation.data as Member;
  
  switch (operation.type) {
    case 'create':
      await memberRepository.create(data);
      break;
    case 'update':
      await memberRepository.update(data.id, data);
      break;
    case 'delete':
      await memberRepository.delete(data.id);
      break;
  }
}

async function processExpenseOperation(operation: QueuedOperation): Promise<void> {
  const data = operation.data as Expense;
  
  switch (operation.type) {
    case 'create':
      await expenseRepository.create(data);
      break;
    case 'update':
      await expenseRepository.update(data.id, data);
      break;
    case 'delete':
      await expenseRepository.delete(data.id);
      break;
  }
}

async function processExpenseSplitOperation(operation: QueuedOperation): Promise<void> {
  const data = operation.data as ExpenseSplit;
  
  switch (operation.type) {
    case 'create':
      await expenseSplitRepository.create(data);
      break;
    case 'update':
      await expenseSplitRepository.update(data.id, data);
      break;
    case 'delete':
      await expenseSplitRepository.delete(data.id);
      break;
  }
}

async function processSettlementOperation(operation: QueuedOperation): Promise<void> {
  const data = operation.data as Settlement;
  
  switch (operation.type) {
    case 'create':
      await settlementRepository.create(data);
      break;
    case 'update':
      await settlementRepository.update(data.id, data);
      break;
    case 'delete':
      await settlementRepository.delete(data.id);
      break;
  }
}
