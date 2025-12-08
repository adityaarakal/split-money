/**
 * Settlement Types
 * 
 * Types for tracking expense settlements between members
 */

/**
 * Settlement - Represents a settlement transaction between two members
 */
export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string; // Member who paid
  toMemberId: string; // Member who received
  amount: number;
  description?: string;
  settledAt: Date;
  createdAt: Date;
}

/**
 * Settlement Status for an expense split
 */
export interface SettlementStatus {
  expenseId: string;
  splitId: string;
  memberId: string;
  amount: number;
  settled: boolean;
  settlementId?: string; // Reference to settlement if settled
}


