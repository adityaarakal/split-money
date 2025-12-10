/**
 * Balance Analytics Service
 * 
 * Provides balance analytics and trends functionality
 */

import { memberRepository, settlementRepository } from '../repositories';
import { calculateGroupBalances, calculateMemberBalance } from './balance.service';
import { format, startOfDay } from 'date-fns';

export interface BalanceTrend {
  date: string; // ISO date string
  totalOwed: number; // Sum of all positive balances (who owes)
  totalOwedTo: number; // Sum of all negative balances (who is owed)
  netBalance: number; // Total net balance
  memberCount: number; // Number of members with non-zero balance
}

export interface BalanceDistribution {
  range: string; // e.g., "$0-$50", "$50-$100"
  memberCount: number;
  totalAmount: number;
}

export interface MemberBalanceTrend {
  memberId: string;
  memberName: string;
  trends: Array<{
    date: string;
    balance: number;
  }>;
}

/**
 * Get balance trends over time for a group
 */
export async function getBalanceTrends(
  groupId: string
): Promise<BalanceTrend[]> {
  try {
    const settlements = await settlementRepository.getByGroupId(groupId);

    // Get current date
    const endDate = new Date();

    // Use all settlements (balance trends show current state)
    const relevantSettlements = settlements;

    // Calculate current balances
    const balances = await calculateGroupBalances(groupId);
    
    // Apply all settlements
    const balancesAfterSettlements = balances.map((balance) => {
      let adjustedBalance = balance.totalOwed;
      
      // Apply settlements that affect this member
      for (const settlement of relevantSettlements) {
        if (settlement.fromMemberId === balance.memberId) {
          adjustedBalance -= settlement.amount;
        } else if (settlement.toMemberId === balance.memberId) {
          adjustedBalance += settlement.amount;
        }
      }
      
      return {
        ...balance,
        totalOwed: adjustedBalance,
      };
    });

    // Calculate summary for the period
    const totalOwed = balancesAfterSettlements
      .filter((b) => b.totalOwed > 0)
      .reduce((sum, b) => sum + b.totalOwed, 0);
    
    const totalOwedTo = Math.abs(
      balancesAfterSettlements
        .filter((b) => b.totalOwed < 0)
        .reduce((sum, b) => sum + b.totalOwed, 0)
    );

    const netBalance = totalOwed - totalOwedTo;
    const memberCount = balancesAfterSettlements.filter((b) => Math.abs(b.totalOwed) > 0.01).length;

    // For trends, we'll create a simple representation showing current state
    // In a real implementation, you'd want to track balance changes over time
    // For now, return a single data point representing current balance state
    return [{
      date: format(startOfDay(endDate), 'yyyy-MM-dd'),
      totalOwed,
      totalOwedTo,
      netBalance,
      memberCount,
    }];
  } catch (error) {
    console.error(`Error getting balance trends for group ${groupId}:`, error);
    throw new Error(`Failed to get balance trends: ${error}`);
  }
}

/**
 * Get balance distribution (how many members owe/are owed in different ranges)
 */
export async function getBalanceDistribution(groupId: string): Promise<BalanceDistribution[]> {
  try {
    const balances = await calculateGroupBalances(groupId);

    // Define ranges
    const ranges = [
      { min: -Infinity, max: -100, label: '< -$100' },
      { min: -100, max: -50, label: '-$100 to -$50' },
      { min: -50, max: -10, label: '-$50 to -$10' },
      { min: -10, max: 0, label: '-$10 to $0' },
      { min: 0, max: 10, label: '$0 to $10' },
      { min: 10, max: 50, label: '$10 to $50' },
      { min: 50, max: 100, label: '$50 to $100' },
      { min: 100, max: Infinity, label: '> $100' },
    ];

    const distribution: BalanceDistribution[] = ranges.map((range) => ({
      range: range.label,
      memberCount: 0,
      totalAmount: 0,
    }));

    balances.forEach((balance) => {
      const amount = balance.totalOwed;
      const rangeIndex = ranges.findIndex(
        (r) => amount >= r.min && amount < r.max
      );
      
      if (rangeIndex >= 0) {
        distribution[rangeIndex].memberCount++;
        distribution[rangeIndex].totalAmount += Math.abs(amount);
      }
    });

    return distribution.filter((d) => d.memberCount > 0);
  } catch (error) {
    console.error(`Error getting balance distribution for group ${groupId}:`, error);
    throw new Error(`Failed to get balance distribution: ${error}`);
  }
}

/**
 * Get member balance trends over time
 */
export async function getMemberBalanceTrends(
  groupId: string
): Promise<MemberBalanceTrend[]> {
  try {
    const members = await memberRepository.getByGroupId(groupId);
    const settlements = await settlementRepository.getByGroupId(groupId);

    const endDate = new Date();
    const relevantSettlements = settlements;

    const memberTrends: MemberBalanceTrend[] = [];

    for (const member of members) {
      // Calculate current balance
      const balance = await calculateMemberBalance(member.id, groupId);
      let adjustedBalance = balance.totalOwed;

      // Apply settlements
      for (const settlement of relevantSettlements) {
        if (settlement.fromMemberId === member.id) {
          adjustedBalance -= settlement.amount;
        } else if (settlement.toMemberId === member.id) {
          adjustedBalance += settlement.amount;
        }
      }

      // Return current balance as a trend point
      memberTrends.push({
        memberId: member.id,
        memberName: member.name,
        trends: [{
          date: format(startOfDay(endDate), 'yyyy-MM-dd'),
          balance: adjustedBalance,
        }],
      });
    }

    return memberTrends;
  } catch (error) {
    console.error(`Error getting member balance trends for group ${groupId}:`, error);
    throw new Error(`Failed to get member balance trends: ${error}`);
  }
}

/**
 * Get balance analytics summary
 */
export interface BalanceAnalyticsSummary {
  totalOwed: number;
  totalOwedTo: number;
  netBalance: number;
  memberCount: number;
  membersOwing: number;
  membersOwed: number;
  averageOwed: number;
  averageOwedTo: number;
}

export async function getBalanceAnalyticsSummary(groupId: string): Promise<BalanceAnalyticsSummary> {
  try {
    const balances = await calculateGroupBalances(groupId);
    
    const totalOwed = balances
      .filter((b) => b.totalOwed > 0)
      .reduce((sum, b) => sum + b.totalOwed, 0);
    
    const totalOwedTo = Math.abs(
      balances
        .filter((b) => b.totalOwed < 0)
        .reduce((sum, b) => sum + b.totalOwed, 0)
    );

    const netBalance = totalOwed - totalOwedTo;
    const memberCount = balances.length;
    const membersOwing = balances.filter((b) => b.totalOwed > 0.01).length;
    const membersOwed = balances.filter((b) => b.totalOwed < -0.01).length;
    
    const averageOwed = membersOwing > 0 ? totalOwed / membersOwing : 0;
    const averageOwedTo = membersOwed > 0 ? totalOwedTo / membersOwed : 0;

    return {
      totalOwed,
      totalOwedTo,
      netBalance,
      memberCount,
      membersOwing,
      membersOwed,
      averageOwed,
      averageOwedTo,
    };
  } catch (error) {
    console.error(`Error getting balance analytics summary for group ${groupId}:`, error);
    throw new Error(`Failed to get balance analytics summary: ${error}`);
  }
}
