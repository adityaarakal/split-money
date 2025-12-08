/**
 * Expense Patterns Service
 * 
 * Analyzes expense patterns and trends
 */

import { expenseRepository } from '../repositories';

export interface ExpensePattern {
  dayOfWeek: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

export interface TimePattern {
  hour: number;
  count: number;
  totalAmount: number;
}

export interface CategoryPattern {
  category: string;
  frequency: number;
  averageAmount: number;
  totalAmount: number;
}

/**
 * Get expense patterns by day of week
 */
export async function getDayOfWeekPatterns(groupId: string): Promise<ExpensePattern[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const unsettledExpenses = expenses.filter((exp) => !exp.settled);

  const dayPatterns: Record<string, { count: number; total: number }> = {
    Sunday: { count: 0, total: 0 },
    Monday: { count: 0, total: 0 },
    Tuesday: { count: 0, total: 0 },
    Wednesday: { count: 0, total: 0 },
    Thursday: { count: 0, total: 0 },
    Friday: { count: 0, total: 0 },
    Saturday: { count: 0, total: 0 },
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  unsettledExpenses.forEach((expense) => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const dayName = dayNames[expenseDate.getDay()];
    
    if (dayPatterns[dayName]) {
      dayPatterns[dayName].count += 1;
      dayPatterns[dayName].total += expense.amount;
    }
  });

  return Object.entries(dayPatterns)
    .map(([dayOfWeek, data]) => ({
      dayOfWeek,
      count: data.count,
      totalAmount: data.total,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
    }))
    .filter((pattern) => pattern.count > 0)
    .sort((a, b) => {
      const dayOrder = dayNames.indexOf(a.dayOfWeek) - dayNames.indexOf(b.dayOfWeek);
      return dayOrder;
    });
}

/**
 * Get expense patterns by category frequency
 */
export async function getCategoryPatterns(groupId: string): Promise<CategoryPattern[]> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const unsettledExpenses = expenses.filter((exp) => !exp.settled);

  const categoryPatterns: Record<string, { frequency: number; total: number }> = {};

  unsettledExpenses.forEach((expense) => {
    const category = expense.category || 'Uncategorized';
    if (!categoryPatterns[category]) {
      categoryPatterns[category] = { frequency: 0, total: 0 };
    }
    categoryPatterns[category].frequency += 1;
    categoryPatterns[category].total += expense.amount;
  });

  return Object.entries(categoryPatterns)
    .map(([category, data]) => ({
      category,
      frequency: data.frequency,
      averageAmount: data.frequency > 0 ? data.total / data.frequency : 0,
      totalAmount: data.total,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get expense patterns by amount ranges
 */
export async function getAmountRangePatterns(groupId: string): Promise<Array<{
  range: string;
  count: number;
  totalAmount: number;
}>> {
  const expenses = await expenseRepository.getByGroupId(groupId);
  const unsettledExpenses = expenses.filter((exp) => !exp.settled);

  const ranges = [
    { label: '$0 - $10', min: 0, max: 10 },
    { label: '$10 - $50', min: 10, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500+', min: 500, max: Infinity },
  ];

  const rangePatterns: Record<string, { count: number; total: number }> = {};

  ranges.forEach((range) => {
    rangePatterns[range.label] = { count: 0, total: 0 };
  });

  unsettledExpenses.forEach((expense) => {
    const amount = expense.amount;
    for (const range of ranges) {
      if (amount >= range.min && amount < range.max) {
        rangePatterns[range.label].count += 1;
        rangePatterns[range.label].total += amount;
        break;
      }
    }
  });

  return Object.entries(rangePatterns)
    .map(([range, data]) => ({
      range,
      count: data.count,
      totalAmount: data.total,
    }))
    .filter((pattern) => pattern.count > 0)
    .sort((a, b) => {
      const aMin = parseFloat(a.range.split(' - ')[0].replace('$', '').replace('+', ''));
      const bMin = parseFloat(b.range.split(' - ')[0].replace('$', '').replace('+', ''));
      return aMin - bMin;
    });
}

