/**
 * Analytics Service
 * 
 * Provides analytics and reporting functionality for expenses and balances
 */

import { expenseRepository, expenseSplitRepository, memberRepository } from '../repositories';

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface SpendingTrend {
  date: string; // ISO date string
  totalAmount: number;
  expenseCount: number;
}

export interface MemberSpending {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  netAmount: number;
  expenseCount: number;
}

export interface TimeBasedAnalysis {
  period: string; // e.g., "2024-12", "2024-W50"
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
}

/**
 * Get category breakdown for a group
 */
export async function getCategoryBreakdown(groupId: string): Promise<CategoryBreakdown[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const categoryTotals: Record<string, { total: number; count: number }> = {};

  expenses.forEach((expense) => {
    if (!expense.settled) {
      const category = expense.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, count: 0 };
      }
      categoryTotals[category].total += expense.amount;
      categoryTotals[category].count += 1;
    }
  });

  const totalAmount = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);

  return Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      totalAmount: data.total,
      expenseCount: data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Get spending trends over time
 */
export async function getSpendingTrends(
  groupId: string,
  days: number = 30
): Promise<SpendingTrend[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    return expenseDate >= cutoffDate && !expense.settled;
  });

  const dailyTotals: Record<string, { total: number; count: number }> = {};

  filteredExpenses.forEach((expense) => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const dateKey = expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { total: 0, count: 0 };
    }
    dailyTotals[dateKey].total += expense.amount;
    dailyTotals[dateKey].count += 1;
  });

  return Object.entries(dailyTotals)
    .map(([date, data]) => ({
      date,
      totalAmount: data.total,
      expenseCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get member-wise spending analysis
 */
export async function getMemberSpending(groupId: string): Promise<MemberSpending[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const members = await memberRepository.getByGroupId(groupId);
  const expenseSplits = await expenseSplitRepository.getAll();

  const memberTotals: Record<string, { paid: number; owed: number; count: number }> = {};

  // Initialize all members
  members.forEach((member) => {
    memberTotals[member.id] = { paid: 0, owed: 0, count: 0 };
  });

  // Calculate totals
  expenses.forEach((expense) => {
    if (!expense.settled) {
      const splits = expenseSplits.filter((split) => split.expenseId === expense.id);
      
      // Amount paid by this member
      if (expense.paidBy in memberTotals) {
        memberTotals[expense.paidBy].paid += expense.amount;
        memberTotals[expense.paidBy].count += 1;
      }

      // Amount owed by members
      splits.forEach((split) => {
        if (split.memberId in memberTotals) {
          memberTotals[split.memberId].owed += split.amount;
        }
      });
    }
  });

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  return Object.entries(memberTotals)
    .map(([memberId, totals]) => ({
      memberId,
      memberName: memberMap.get(memberId) || 'Unknown',
      totalPaid: totals.paid,
      totalOwed: totals.owed,
      netAmount: totals.paid - totals.owed,
      expenseCount: totals.count,
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid);
}

/**
 * Get time-based analysis (monthly/weekly)
 */
export async function getTimeBasedAnalysis(
  groupId: string,
  period: 'monthly' | 'weekly' = 'monthly'
): Promise<TimeBasedAnalysis[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const filteredExpenses = expenses.filter((expense) => !expense.settled);

  const periodTotals: Record<string, { total: number; count: number }> = {};

  filteredExpenses.forEach((expense) => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    let periodKey: string;

    if (period === 'monthly') {
      periodKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // Weekly: YYYY-WXX format
      const year = expenseDate.getFullYear();
      const week = getWeekNumber(expenseDate);
      periodKey = `${year}-W${String(week).padStart(2, '0')}`;
    }

    if (!periodTotals[periodKey]) {
      periodTotals[periodKey] = { total: 0, count: 0 };
    }
    periodTotals[periodKey].total += expense.amount;
    periodTotals[periodKey].count += 1;
  });

  return Object.entries(periodTotals)
    .map(([period, data]) => ({
      period,
      totalAmount: data.total,
      expenseCount: data.count,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get group comparison data
 */
export async function getGroupComparison(groupIds: string[]): Promise<Array<{
  groupId: string;
  groupName: string;
  totalExpenses: number;
  totalAmount: number;
  memberCount: number;
  averagePerMember: number;
}>> {
  const results = await Promise.all(
    groupIds.map(async (groupId) => {
      const expenses = await expenseRepository.getByGroupId(groupId);
      const members = await memberRepository.getByGroupId(groupId);
      const unsettledExpenses = expenses.filter((exp) => !exp.settled);
      
      const totalAmount = unsettledExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const averagePerMember = members.length > 0 ? totalAmount / members.length : 0;

      return {
        groupId,
        groupName: `Group ${groupId.slice(0, 8)}`, // Placeholder - should get actual name
        totalExpenses: unsettledExpenses.length,
        totalAmount,
        memberCount: members.length,
        averagePerMember,
      };
    })
  );

  return results.sort((a, b) => b.totalAmount - a.totalAmount);
}

