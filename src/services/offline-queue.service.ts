/**
 * Offline Queue Service
 * 
 * Manages a queue of operations to be executed when back online
 */

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'group' | 'member' | 'expense' | 'expenseSplit' | 'settlement';
  data: unknown;
  timestamp: number;
  retries: number;
}

const QUEUE_STORAGE_KEY = 'offline-queue';
const MAX_RETRIES = 3;

/**
 * Get all queued operations
 */
export function getQueuedOperations(): QueuedOperation[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading offline queue:', error);
  }
  return [];
}

/**
 * Add operation to queue
 */
export function queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): string {
  const operations = getQueuedOperations();
  const id = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const queuedOperation: QueuedOperation = {
    ...operation,
    id,
    timestamp: Date.now(),
    retries: 0,
  };

  operations.push(queuedOperation);
  saveQueuedOperations(operations);
  
  return id;
}

/**
 * Remove operation from queue
 */
export function removeQueuedOperation(operationId: string): void {
  const operations = getQueuedOperations();
  const filtered = operations.filter((op) => op.id !== operationId);
  saveQueuedOperations(filtered);
}

/**
 * Increment retry count for an operation
 */
export function incrementRetry(operationId: string): boolean {
  const operations = getQueuedOperations();
  const operation = operations.find((op) => op.id === operationId);
  
  if (!operation) {
    return false;
  }

  operation.retries += 1;
  
  // Remove if max retries exceeded
  if (operation.retries >= MAX_RETRIES) {
    removeQueuedOperation(operationId);
    return false;
  }

  saveQueuedOperations(operations);
  return true;
}

/**
 * Clear all queued operations
 */
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

/**
 * Save queued operations to storage
 */
function saveQueuedOperations(operations: QueuedOperation[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(operations));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
}

/**
 * Get queue statistics
 */
export function getQueueStats() {
  const operations = getQueuedOperations();
  return {
    total: operations.length,
    byType: operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byEntity: operations.reduce((acc, op) => {
      acc[op.entity] = (acc[op.entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
