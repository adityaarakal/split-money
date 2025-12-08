/**
 * Balance Calculation Service
 * 
 * Calculates balances for members in groups based on expenses and splits
 */

import type { Balance } from '../types';
import { expenseRepository, expenseSplitRepository, memberRepository } from '../repositories';

/**
 * Calculate balance for a member in a group
 */
export async function calculateMemberBalance(
  memberId: string,
  groupId: string
): Promise<Balance> {
  try {
    // Get all expenses in the group
    const expenses = await expenseRepository.getByGroupId(groupId);
    
    // Get all expense splits for this member
    const memberSplits = await expenseSplitRepository.getByMemberId(memberId);
    
    // Filter splits for expenses in this group
    const groupExpenseIds = new Set(expenses.map((e) => e.id));
    const relevantSplits = memberSplits.filter((split) =>
      groupExpenseIds.has(split.expenseId)
    );

    // Calculate total owed (positive = owes money, negative = owed money)
    let totalOwed = 0;

    // For each expense in the group
    for (const expense of expenses) {
      const memberSplit = relevantSplits.find((s) => s.expenseId === expense.id);
      
      if (memberSplit) {
        // Member is part of this expense split
        if (expense.paidBy === memberId) {
          // Member paid, so they are owed the split amount
          totalOwed -= memberSplit.amount;
        } else {
          // Member didn't pay, so they owe the split amount
          totalOwed += memberSplit.amount;
        }
      } else if (expense.paidBy === memberId) {
        // Member paid but no split exists (shouldn't happen, but handle gracefully)
        // In this case, member paid full amount but no one owes them
        // This is a data integrity issue, but we'll handle it
      }
    }

    // Get member's expenses in this group
    const memberExpenses = expenses.filter((e) => e.paidBy === memberId);

    return {
      memberId,
      groupId,
      totalOwed,
      expenses: memberExpenses,
    };
  } catch (error) {
    console.error(`Error calculating balance for member ${memberId}:`, error);
    throw new Error(`Failed to calculate balance: ${error}`);
  }
}

/**
 * Calculate balances for all members in a group
 */
export async function calculateGroupBalances(groupId: string): Promise<Balance[]> {
  try {
    const members = await memberRepository.getByGroupId(groupId);
    const balances = await Promise.all(
      members.map((member) => calculateMemberBalance(member.id, groupId))
    );
    return balances;
  } catch (error) {
    console.error(`Error calculating balances for group ${groupId}:`, error);
    throw new Error(`Failed to calculate group balances: ${error}`);
  }
}

/**
 * Get simplified balance summary (who owes whom)
 */
export interface BalanceSummary {
  memberId: string;
  memberName: string;
  totalOwed: number;
}

export async function getBalanceSummary(groupId: string): Promise<BalanceSummary[]> {
  try {
    const balances = await calculateGroupBalances(groupId);
    const members = await memberRepository.getByGroupId(groupId);
    const memberMap = new Map(members.map((m) => [m.id, m]));

    return balances.map((balance) => ({
      memberId: balance.memberId,
      memberName: memberMap.get(balance.memberId)?.name || 'Unknown',
      totalOwed: balance.totalOwed,
    }));
  } catch (error) {
    console.error(`Error getting balance summary for group ${groupId}:`, error);
    throw new Error(`Failed to get balance summary: ${error}`);
  }
}

