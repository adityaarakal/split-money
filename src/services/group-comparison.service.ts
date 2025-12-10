/**
 * Group Comparison Service
 * 
 * Provides functionality to compare spending across multiple groups
 */

import { groupRepository } from '../repositories';
import { getCategoryBreakdown, getMemberSpending, type CategoryBreakdown } from './analytics.service';

export interface GroupComparison {
  groupId: string;
  groupName: string;
  totalAmount: number;
  expenseCount: number;
  memberCount: number;
  averagePerMember: number;
  averagePerExpense: number;
  categoryBreakdown: CategoryBreakdown[];
  topSpenders: Array<{ memberName: string; totalPaid: number }>;
}

/**
 * Compare multiple groups
 */
export async function compareGroups(groupIds: string[]): Promise<GroupComparison[]> {
  try {
    const comparisons = await Promise.all(
      groupIds.map(async (groupId) => {
        const group = await groupRepository.getById(groupId);
        if (!group) {
          throw new Error(`Group ${groupId} not found`);
        }
        
        const [categoryBreakdown, memberSpending] = await Promise.all([
          getCategoryBreakdown(groupId),
          getMemberSpending(groupId),
        ]);

        const totalAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0);
        const expenseCount = categoryBreakdown.reduce((sum, cat) => sum + cat.expenseCount, 0);
        const memberCount = memberSpending.length;
        const averagePerMember = memberCount > 0 ? totalAmount / memberCount : 0;
        const averagePerExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;

        // Get top spenders
        const topSpenders = memberSpending
          .sort((a, b) => b.totalPaid - a.totalPaid)
          .slice(0, 5)
          .map((m) => ({
            memberName: m.memberName,
            totalPaid: m.totalPaid,
          }));

        return {
          groupId,
          groupName: group.name,
          totalAmount,
          expenseCount,
          memberCount,
          averagePerMember,
          averagePerExpense,
          categoryBreakdown,
          topSpenders,
        };
      })
    );

    return comparisons;
  } catch (error) {
    console.error('Error comparing groups:', error);
    throw new Error(`Failed to compare groups: ${error}`);
  }
}

/**
 * Get comparison summary statistics
 */
export interface ComparisonSummary {
  totalGroups: number;
  totalAmount: number;
  totalExpenses: number;
  totalMembers: number;
  averagePerGroup: number;
  averagePerMember: number;
  averagePerExpense: number;
  highestSpendingGroup: { name: string; amount: number };
  lowestSpendingGroup: { name: string; amount: number };
}

export function getComparisonSummary(comparisons: GroupComparison[]): ComparisonSummary {
  if (comparisons.length === 0) {
    return {
      totalGroups: 0,
      totalAmount: 0,
      totalExpenses: 0,
      totalMembers: 0,
      averagePerGroup: 0,
      averagePerMember: 0,
      averagePerExpense: 0,
      highestSpendingGroup: { name: '', amount: 0 },
      lowestSpendingGroup: { name: '', amount: 0 },
    };
  }

  const totalAmount = comparisons.reduce((sum, comp) => sum + comp.totalAmount, 0);
  const totalExpenses = comparisons.reduce((sum, comp) => sum + comp.expenseCount, 0);
  const totalMembers = comparisons.reduce((sum, comp) => sum + comp.memberCount, 0);
  const averagePerGroup = totalAmount / comparisons.length;
  const averagePerMember = totalMembers > 0 ? totalAmount / totalMembers : 0;
  const averagePerExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  const sortedByAmount = [...comparisons].sort((a, b) => b.totalAmount - a.totalAmount);
  const highestSpendingGroup = {
    name: sortedByAmount[0].groupName,
    amount: sortedByAmount[0].totalAmount,
  };
  const lowestSpendingGroup = {
    name: sortedByAmount[sortedByAmount.length - 1].groupName,
    amount: sortedByAmount[sortedByAmount.length - 1].totalAmount,
  };

  return {
    totalGroups: comparisons.length,
    totalAmount,
    totalExpenses,
    totalMembers,
    averagePerGroup,
    averagePerMember,
    averagePerExpense,
    highestSpendingGroup,
    lowestSpendingGroup,
  };
}
