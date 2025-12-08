/**
 * Report Service
 * 
 * Provides report generation and export functionality
 */

import type { CategoryBreakdown, SpendingTrend, MemberSpending, TimeBasedAnalysis } from './analytics.service';
import type { Group } from '../types';
import { downloadCSV } from './balance-export.service';

export interface ReportData {
  group: Group;
  categoryBreakdown: CategoryBreakdown[];
  spendingTrends: SpendingTrend[];
  memberSpending: MemberSpending[];
  timeAnalysis: TimeBasedAnalysis[];
  totalExpenses: number;
  totalAmount: number;
  memberCount: number;
  generatedAt: Date;
}

/**
 * Generate comprehensive report text
 */
export function generateReportText(data: ReportData): string {
  const {
    group,
    categoryBreakdown,
    spendingTrends,
    memberSpending,
    timeAnalysis,
    totalExpenses,
    totalAmount,
    memberCount,
    generatedAt,
  } = data;

  const report = [
    '='.repeat(60),
    `EXPENSE REPORT: ${group.name}`,
    '='.repeat(60),
    '',
    `Generated: ${generatedAt.toLocaleString()}`,
    `Group: ${group.name}`,
    group.description ? `Description: ${group.description}` : '',
    '',
    '='.repeat(60),
    'SUMMARY',
    '='.repeat(60),
    '',
    `Total Expenses: ${totalExpenses}`,
    `Total Amount: $${totalAmount.toFixed(2)}`,
    `Members: ${memberCount}`,
    `Average per Member: $${memberCount > 0 ? (totalAmount / memberCount).toFixed(2) : '0.00'}`,
    '',
    '='.repeat(60),
    'CATEGORY BREAKDOWN',
    '='.repeat(60),
    '',
    ...categoryBreakdown.map((item) =>
      `${item.category.padEnd(20)} $${item.totalAmount.toFixed(2).padStart(10)} (${item.percentage.toFixed(1)}%) - ${item.expenseCount} expenses`
    ),
    '',
    '='.repeat(60),
    'MEMBER SPENDING',
    '='.repeat(60),
    '',
    ...memberSpending.map((item) => {
      const name = item.memberName.padEnd(20);
      const paid = `$${item.totalPaid.toFixed(2)}`.padStart(10);
      const owed = `$${item.totalOwed.toFixed(2)}`.padStart(10);
      const net = `$${item.netAmount.toFixed(2)}`.padStart(10);
      return `${name} Paid: ${paid} | Owed: ${owed} | Net: ${net}`;
    }),
    '',
    '='.repeat(60),
    'SPENDING TRENDS',
    '='.repeat(60),
    '',
    ...spendingTrends.slice(-10).map((item) => {
      const date = item.date.padEnd(15);
      const amount = `$${item.totalAmount.toFixed(2)}`.padStart(10);
      const count = `${item.expenseCount} expenses`;
      return `${date} ${amount} (${count})`;
    }),
    '',
    '='.repeat(60),
    'TIME-BASED ANALYSIS',
    '='.repeat(60),
    '',
    ...timeAnalysis.map((item) => {
      const period = item.period.padEnd(15);
      const total = `$${item.totalAmount.toFixed(2)}`.padStart(10);
      const avg = `$${item.averageAmount.toFixed(2)}`.padStart(10);
      const count = item.expenseCount;
      return `${period} Total: ${total} | Avg: ${avg} | Count: ${count}`;
    }),
    '',
    '='.repeat(60),
    'END OF REPORT',
    '='.repeat(60),
  ]
    .filter((line) => line !== '')
    .join('\n');

  return report;
}

/**
 * Generate comprehensive report CSV
 */
export function generateReportCSV(data: ReportData): string {
  const {
    group,
    categoryBreakdown,
    spendingTrends,
    memberSpending,
    timeAnalysis,
    totalExpenses,
    totalAmount,
    memberCount,
    generatedAt,
  } = data;

  const csvSections = [
    // Summary
    [
      'Report: Expense Analysis',
      `Group: ${group.name}`,
      `Generated: ${generatedAt.toISOString()}`,
      '',
      'SUMMARY',
      'Metric,Value',
      `Total Expenses,${totalExpenses}`,
      `Total Amount,${totalAmount.toFixed(2)}`,
      `Members,${memberCount}`,
      `Average per Member,${memberCount > 0 ? (totalAmount / memberCount).toFixed(2) : '0.00'}`,
      '',
    ],
    // Category Breakdown
    [
      'CATEGORY BREAKDOWN',
      'Category,Total Amount,Expense Count,Percentage',
      ...categoryBreakdown.map((item) =>
        `${item.category},${item.totalAmount.toFixed(2)},${item.expenseCount},${item.percentage.toFixed(2)}`
      ),
      '',
    ],
    // Member Spending
    [
      'MEMBER SPENDING',
      'Member Name,Total Paid,Total Owed,Net Amount,Expense Count',
      ...memberSpending.map((item) =>
        `${item.memberName},${item.totalPaid.toFixed(2)},${item.totalOwed.toFixed(2)},${item.netAmount.toFixed(2)},${item.expenseCount}`
      ),
      '',
    ],
    // Spending Trends
    [
      'SPENDING TRENDS',
      'Date,Total Amount,Expense Count',
      ...spendingTrends.map((item) => `${item.date},${item.totalAmount.toFixed(2)},${item.expenseCount}`),
      '',
    ],
    // Time Analysis
    [
      'TIME-BASED ANALYSIS',
      'Period,Total Amount,Expense Count,Average Amount',
      ...timeAnalysis.map((item) =>
        `${item.period},${item.totalAmount.toFixed(2)},${item.expenseCount},${item.averageAmount.toFixed(2)}`
      ),
    ],
  ];

  return csvSections.flat().join('\n');
}

/**
 * Download report as text file
 */
export function downloadReportText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate and download comprehensive report
 */
export async function generateAndDownloadReport(
  data: ReportData,
  format: 'text' | 'csv' = 'csv'
): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `expense-report-${data.group.id.slice(0, 8)}-${timestamp}`;

  if (format === 'csv') {
    const csv = generateReportCSV(data);
    downloadCSV(csv, `${filename}.csv`);
  } else {
    const text = generateReportText(data);
    downloadReportText(text, `${filename}.txt`);
  }
}

