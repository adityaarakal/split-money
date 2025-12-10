/**
 * Balance Export Service
 * 
 * Provides functionality to export balance data in various formats
 */

import type { BalanceSummary } from './balance.service';
import type { Debt } from './balance-optimization.service';
import type { Settlement } from '../types/settlement';

/**
 * Export balance summary as CSV
 */
export function exportBalanceSummaryAsCSV(
  summary: BalanceSummary[],
  groupName: string
): string {
  const headers = ['Member Name', 'Balance', 'Status'];
  const rows = summary.map((item) => {
    const status = item.totalOwed > 0 ? 'Owes' : item.totalOwed < 0 ? 'Owed' : 'Settled';
    return [
      item.memberName,
      item.totalOwed.toFixed(2),
      status,
    ];
  });

  const csvContent = [
    `Group: ${groupName}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export debts as CSV
 */
export function exportDebtsAsCSV(
  debts: Debt[],
  groupName: string
): string {
  const headers = ['From Member', 'To Member', 'Amount'];
  const rows = debts.map((debt) => [
    debt.fromMemberName,
    debt.toMemberName,
    debt.amount.toFixed(2),
  ]);

  const csvContent = [
    `Group: ${groupName}`,
    `Debts Summary`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export settlement history as CSV
 */
export function exportSettlementsAsCSV(
  settlements: Settlement[],
  groupName: string,
  members: Array<{ id: string; name: string }>
): string {
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const headers = ['Date', 'From Member', 'To Member', 'Amount', 'Description'];
  const rows = settlements.map((settlement) => {
    const date = settlement.settledAt instanceof Date 
      ? settlement.settledAt 
      : new Date(settlement.settledAt);
    
    return [
      date.toISOString().split('T')[0],
      getMemberName(settlement.fromMemberId),
      getMemberName(settlement.toMemberId),
      settlement.amount.toFixed(2),
      settlement.description || '',
    ];
  });

  const csvContent = [
    `Group: ${groupName}`,
    `Settlement History`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
 * Export complete balance report
 */
export function exportBalanceReport(
  summary: BalanceSummary[],
  debts: Debt[],
  settlements: Settlement[],
  groupName: string,
  members: Array<{ id: string; name: string }>
): string {
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const report = [
    `Balance Report: ${groupName}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '='.repeat(50),
    'MEMBER BALANCES',
    '='.repeat(50),
    '',
    ...summary.map((item) => {
      const status = item.totalOwed > 0 
        ? `Owes $${Math.abs(item.totalOwed).toFixed(2)}`
        : item.totalOwed < 0 
        ? `Owed $${Math.abs(item.totalOwed).toFixed(2)}`
        : 'Settled up';
      return `${item.memberName}: ${status}`;
    }),
    '',
    '='.repeat(50),
    'SIMPLIFIED DEBTS',
    '='.repeat(50),
    '',
    ...debts.map((debt) => 
      `${debt.fromMemberName} owes ${debt.toMemberName}: $${debt.amount.toFixed(2)}`
    ),
    '',
    '='.repeat(50),
    'SETTLEMENT HISTORY',
    '='.repeat(50),
    '',
    ...settlements.map((settlement) => {
      const date = settlement.settledAt instanceof Date 
        ? settlement.settledAt 
        : new Date(settlement.settledAt);
      return `[${date.toLocaleDateString()}] ${getMemberName(settlement.fromMemberId)} paid ${getMemberName(settlement.toMemberId)}: $${settlement.amount.toFixed(2)}${settlement.description ? ` - ${settlement.description}` : ''}`;
    }),
  ].join('\n');

  return report;
}



