/**
 * Report Templates Service
 * 
 * Provides predefined report templates for different use cases
 */

import type { ReportData } from './report.service';
import { generateReportText, generateReportCSV, generateReportPDF } from './report.service';

export type ReportTemplate = 'summary' | 'detailed' | 'category_focus' | 'member_focus' | 'trends_focus';

export interface TemplateConfig {
  name: string;
  description: string;
  includeCategories: boolean;
  includeMembers: boolean;
  includeTrends: boolean;
  includeTimeAnalysis: boolean;
  includePatterns: boolean;
  includeBalanceAnalytics: boolean;
}

export const REPORT_TEMPLATES: Record<ReportTemplate, TemplateConfig> = {
  summary: {
    name: 'Summary Report',
    description: 'Quick overview with key metrics and totals',
    includeCategories: true,
    includeMembers: true,
    includeTrends: false,
    includeTimeAnalysis: false,
    includePatterns: false,
    includeBalanceAnalytics: false,
  },
  detailed: {
    name: 'Detailed Report',
    description: 'Comprehensive report with all analytics and data',
    includeCategories: true,
    includeMembers: true,
    includeTrends: true,
    includeTimeAnalysis: true,
    includePatterns: true,
    includeBalanceAnalytics: true,
  },
  category_focus: {
    name: 'Category Focus',
    description: 'Focus on category breakdown and spending by category',
    includeCategories: true,
    includeMembers: false,
    includeTrends: false,
    includeTimeAnalysis: false,
    includePatterns: true,
    includeBalanceAnalytics: false,
  },
  member_focus: {
    name: 'Member Focus',
    description: 'Focus on member spending and balances',
    includeCategories: false,
    includeMembers: true,
    includeTrends: false,
    includeTimeAnalysis: false,
    includePatterns: false,
    includeBalanceAnalytics: true,
  },
  trends_focus: {
    name: 'Trends Focus',
    description: 'Focus on spending trends and time-based analysis',
    includeCategories: false,
    includeMembers: false,
    includeTrends: true,
    includeTimeAnalysis: true,
    includePatterns: false,
    includeBalanceAnalytics: false,
  },
};

/**
 * Generate report using a template
 */
export function generateReportWithTemplate(
  data: ReportData,
  template: ReportTemplate,
  format: 'text' | 'csv' | 'pdf' = 'pdf'
): void {
  const config = REPORT_TEMPLATES[template];
  
  // Create filtered data based on template
  const filteredData: ReportData = {
    ...data,
    categoryBreakdown: config.includeCategories ? data.categoryBreakdown : [],
    memberSpending: config.includeMembers ? data.memberSpending : [],
    spendingTrends: config.includeTrends ? data.spendingTrends : [],
    timeAnalysis: config.includeTimeAnalysis ? data.timeAnalysis : [],
  };

  if (format === 'pdf') {
    generateReportPDF(filteredData);
  } else if (format === 'csv') {
    generateReportCSV(filteredData);
    // The CSV is already downloaded by generateReportCSV
  } else {
    generateReportText(filteredData);
    // The text is already downloaded by generateReportText
  }
}

/**
 * Get available report templates
 */
export function getAvailableTemplates(): Array<{ id: ReportTemplate; config: TemplateConfig }> {
  return Object.entries(REPORT_TEMPLATES).map(([id, config]) => ({
    id: id as ReportTemplate,
    config,
  }));
}
