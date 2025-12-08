/**
 * Balance Optimization Service
 * 
 * Provides optimized balance calculations with caching and simplified debt resolution
 */

import type { Balance, Member } from '../types';
import { calculateGroupBalances, type BalanceSummary } from './balance.service';

/**
 * Simplified debt representation for "who owes whom"
 */
export interface Debt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

/**
 * Balance cache entry
 */
interface BalanceCache {
  groupId: string;
  balances: Balance[];
  summary: BalanceSummary[];
  debts: Debt[];
  calculatedAt: Date;
}

// Simple in-memory cache (can be enhanced with IndexedDB later)
const balanceCache = new Map<string, BalanceCache>();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Clear cache for a group
 */
export function clearBalanceCache(groupId: string): void {
  balanceCache.delete(groupId);
}

/**
 * Clear all balance caches
 */
export function clearAllBalanceCaches(): void {
  balanceCache.clear();
}

/**
 * Check if cache is valid
 */
function isCacheValid(cache: BalanceCache): boolean {
  const age = Date.now() - cache.calculatedAt.getTime();
  return age < CACHE_TTL;
}

/**
 * Calculate simplified debts (who owes whom)
 * Uses a simplified algorithm to minimize transactions
 */
export async function calculateSimplifiedDebts(
  groupId: string,
  members: Member[]
): Promise<Debt[]> {
  const balances = await calculateGroupBalances(groupId);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  // Create balance map
  const balanceMap = new Map<string, number>();
  balances.forEach((balance) => {
    balanceMap.set(balance.memberId, balance.totalOwed);
  });

  // Separate creditors (negative balance) and debtors (positive balance)
  const creditors: Array<{ memberId: string; amount: number }> = [];
  const debtors: Array<{ memberId: string; amount: number }> = [];

  balanceMap.forEach((amount, memberId) => {
    if (amount < 0) {
      creditors.push({ memberId, amount: Math.abs(amount) });
    } else if (amount > 0) {
      debtors.push({ memberId, amount });
    }
  });

  // Sort by amount (largest first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Match creditors with debtors to minimize transactions
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      // Only create debt if amount is significant (> 1 cent)
      debts.push({
        fromMemberId: debtor.memberId,
        fromMemberName: memberMap.get(debtor.memberId)?.name || 'Unknown',
        toMemberId: creditor.memberId,
        toMemberName: memberMap.get(creditor.memberId)?.name || 'Unknown',
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
  }

  return debts;
}

/**
 * Get cached or calculate balances for a group
 */
export async function getCachedGroupBalances(
  groupId: string,
  members: Member[]
): Promise<{
  balances: Balance[];
  summary: BalanceSummary[];
  debts: Debt[];
}> {
  const cached = balanceCache.get(groupId);

  if (cached && isCacheValid(cached)) {
    return {
      balances: cached.balances,
      summary: cached.summary,
      debts: cached.debts,
    };
  }

  // Calculate fresh balances
  const balances = await calculateGroupBalances(groupId);
  const summary: BalanceSummary[] = balances.map((balance) => {
    const member = members.find((m) => m.id === balance.memberId);
    return {
      memberId: balance.memberId,
      memberName: member?.name || 'Unknown',
      totalOwed: balance.totalOwed,
    };
  });
  const debts = await calculateSimplifiedDebts(groupId, members);

  // Cache the results
  balanceCache.set(groupId, {
    groupId,
    balances,
    summary,
    debts,
    calculatedAt: new Date(),
  });

  return { balances, summary, debts };
}

