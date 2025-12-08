/**
 * Expense Template Service
 * Manages expense templates for quick expense creation
 */

import type { Expense, ExpenseSplit } from '../types';

export interface ExpenseTemplate {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  splitType: 'equal' | 'custom' | 'percentage';
  memberIds: string[];
  customAmounts?: Record<string, number>;
  percentages?: Record<string, number>;
  createdAt: Date;
}

const STORAGE_KEY = 'expense_templates';

/**
 * Get all templates
 */
export function getAllTemplates(): ExpenseTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored) as Array<{
      id: string;
      name: string;
      description: string;
      amount: number;
      category: string;
      splitType: 'equal' | 'custom' | 'percentage';
      memberIds: string[];
      customAmounts?: Record<string, number>;
      percentages?: Record<string, number>;
      createdAt: string;
    }>;
    return data.map((template) => ({
      ...template,
      createdAt: new Date(template.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ExpenseTemplate | null {
  const templates = getAllTemplates();
  return templates.find((t) => t.id === id) || null;
}

/**
 * Create a template from an expense
 */
export function createTemplate(
  name: string,
  expense: Expense,
  splits: ExpenseSplit[],
  splitType: 'equal' | 'custom' | 'percentage',
  customAmounts?: Record<string, number>,
  percentages?: Record<string, number>
): ExpenseTemplate {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Template name cannot be empty');
  }

  const existing = getAllTemplates();
  if (existing.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('Template with this name already exists');
  }

  const template: ExpenseTemplate = {
    id: `template-${Date.now()}`,
    name: trimmedName,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    splitType,
    memberIds: splits.map((s) => s.memberId),
    customAmounts,
    percentages,
    createdAt: new Date(),
  };

  const templates = getAllTemplates();
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));

  return template;
}

/**
 * Delete a template
 */
export function deleteTemplate(templateId: string): void {
  const templates = getAllTemplates();
  const filtered = templates.filter((t) => t.id !== templateId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Apply template to create expense and splits
 */
export function applyTemplate(
  template: ExpenseTemplate,
  groupId: string,
  paidBy: string,
  date: Date
): { expense: Expense; splits: ExpenseSplit[] } {
  const expense: Expense = {
    id: `expense-${Date.now()}`,
    groupId,
    paidBy,
    amount: template.amount,
    description: template.description,
    category: template.category,
    date,
    settled: false,
    createdAt: new Date(),
  };

  // Generate splits based on template
  const splits: ExpenseSplit[] = template.memberIds.map((memberId) => {
    let amount = 0;
    let percentage: number | undefined;

    switch (template.splitType) {
      case 'equal':
        amount = template.amount / template.memberIds.length;
        break;
      case 'custom':
        amount = template.customAmounts?.[memberId] || 0;
        break;
      case 'percentage':
        percentage = template.percentages?.[memberId] || 0;
        amount = (template.amount * percentage) / 100;
        break;
    }

    return {
      id: `${expense.id}-${memberId}`,
      expenseId: expense.id,
      memberId,
      amount,
      percentage,
      settled: false,
    };
  });

  return { expense, splits };
}

