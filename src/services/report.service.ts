/**
 * Report Service
 * 
 * Provides report generation and export functionality
 */

import type { CategoryBreakdown, SpendingTrend, MemberSpending, TimeBasedAnalysis } from './analytics.service';
import type { Group } from '../types';
import { downloadCSV } from './balance-export.service';
import jsPDF from 'jspdf';

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
 * Generate PDF report
 */
export function generateReportPDF(data: ReportData): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  const lineHeight = 7;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`EXPENSE REPORT: ${data.group.name}`, margin, yPosition);
  yPosition += lineHeight * 1.5;

  // Generated date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${data.generatedAt.toLocaleString()}`, margin, yPosition);
  yPosition += lineHeight;

  if (data.group.description) {
    doc.text(`Description: ${data.group.description}`, margin, yPosition);
    yPosition += lineHeight;
  }
  yPosition += lineHeight;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  checkNewPage(lineHeight * 5);
  doc.text(`Total Expenses: ${data.totalExpenses}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Total Amount: $${data.totalAmount.toFixed(2)}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Members: ${data.memberCount}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(
    `Average per Member: $${data.memberCount > 0 ? (data.totalAmount / data.memberCount).toFixed(2) : '0.00'}`,
    margin,
    yPosition
  );
  yPosition += lineHeight * 1.5;

  // Category Breakdown
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  checkNewPage(lineHeight * 2);
  doc.text('CATEGORY BREAKDOWN', margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.categoryBreakdown.forEach((item) => {
    checkNewPage(lineHeight);
    const text = `${item.category}: $${item.totalAmount.toFixed(2)} (${item.percentage.toFixed(1)}%) - ${item.expenseCount} expenses`;
    doc.text(text, margin, yPosition);
    yPosition += lineHeight;
  });
  yPosition += lineHeight;

  // Member Spending
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  checkNewPage(lineHeight * 2);
  doc.text('MEMBER SPENDING', margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.memberSpending.forEach((item) => {
    checkNewPage(lineHeight);
    const text = `${item.memberName}: Paid $${item.totalPaid.toFixed(2)} | Owed $${item.totalOwed.toFixed(2)} | Net $${item.netAmount.toFixed(2)}`;
    doc.text(text, margin, yPosition);
    yPosition += lineHeight;
  });
  yPosition += lineHeight;

  // Spending Trends (last 10)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  checkNewPage(lineHeight * 2);
  doc.text('RECENT SPENDING TRENDS', margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.spendingTrends.slice(-10).forEach((item) => {
    checkNewPage(lineHeight);
    const text = `${item.date}: $${item.totalAmount.toFixed(2)} (${item.expenseCount} expenses)`;
    doc.text(text, margin, yPosition);
    yPosition += lineHeight;
  });

  // Download PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `expense-report-${data.group.id.slice(0, 8)}-${timestamp}.pdf`;
  doc.save(filename);
}

/**
 * Generate and download comprehensive report
 */
export async function generateAndDownloadReport(
  data: ReportData,
  format: 'text' | 'csv' | 'pdf' = 'csv'
): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `expense-report-${data.group.id.slice(0, 8)}-${timestamp}`;

  if (format === 'pdf') {
    generateReportPDF(data);
  } else if (format === 'csv') {
    const csv = generateReportCSV(data);
    downloadCSV(csv, `${filename}.csv`);
  } else {
    const text = generateReportText(data);
    downloadReportText(text, `${filename}.txt`);
  }
}

