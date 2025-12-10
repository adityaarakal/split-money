/**
 * Balance Alerts Service
 * 
 * Provides in-app balance alerts and notifications (client-side, no backend required)
 */

import { calculateGroupBalances } from './balance.service';
import { memberRepository } from '../repositories';

export interface BalanceAlert {
  id: string;
  groupId: string;
  groupName: string;
  memberId: string;
  memberName: string;
  type: 'high_balance' | 'owed_to_you' | 'you_owe';
  amount: number;
  threshold?: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: Date;
  acknowledged: boolean;
}

export interface BalanceAlertPreferences {
  enabled: boolean;
  highBalanceThreshold: number; // Alert if balance exceeds this amount
  owedToYouThreshold: number; // Alert if someone owes you more than this
  youOweThreshold: number; // Alert if you owe more than this
  showHighBalanceAlerts: boolean;
  showOwedToYouAlerts: boolean;
  showYouOweAlerts: boolean;
}

const STORAGE_KEY = 'balance-alert-preferences';

const DEFAULT_PREFERENCES: BalanceAlertPreferences = {
  enabled: true,
  highBalanceThreshold: 100, // $100
  owedToYouThreshold: 50, // $50
  youOweThreshold: 50, // $50
  showHighBalanceAlerts: true,
  showOwedToYouAlerts: true,
  showYouOweAlerts: true,
};

/**
 * Get balance alert preferences
 */
export function getBalanceAlertPreferences(): BalanceAlertPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading balance alert preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save balance alert preferences
 */
export function saveBalanceAlertPreferences(preferences: BalanceAlertPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving balance alert preferences:', error);
  }
}

/**
 * Check for balance alerts in a group
 */
export async function checkBalanceAlerts(
  groupId: string,
  groupName: string,
  currentMemberId?: string
): Promise<BalanceAlert[]> {
  const preferences = getBalanceAlertPreferences();
  
  if (!preferences.enabled) {
    return [];
  }

  try {
    const balances = await calculateGroupBalances(groupId);
    const members = await memberRepository.getByGroupId(groupId);
    const memberMap = new Map(members.map((m) => [m.id, m]));
    
    const alerts: BalanceAlert[] = [];
    const now = new Date();

    for (const balance of balances) {
      const memberName = memberMap.get(balance.memberId)?.name || 'Unknown';
      const amount = Math.abs(balance.totalOwed);

      // High balance alert
      if (
        preferences.showHighBalanceAlerts &&
        amount >= preferences.highBalanceThreshold
      ) {
        alerts.push({
          id: `alert-${groupId}-${balance.memberId}-high-${now.getTime()}`,
          groupId,
          groupName,
          memberId: balance.memberId,
          memberName,
          type: 'high_balance',
          amount,
          threshold: preferences.highBalanceThreshold,
          message: `${memberName} has a balance of $${amount.toFixed(2)} in ${groupName}`,
          severity: amount >= preferences.highBalanceThreshold * 2 ? 'error' : 'warning',
          createdAt: now,
          acknowledged: false,
        });
      }

      // Owed to you alert (if checking for current member)
      if (
        currentMemberId &&
        preferences.showOwedToYouAlerts &&
        balance.memberId !== currentMemberId &&
        balance.totalOwed < 0 &&
        Math.abs(balance.totalOwed) >= preferences.owedToYouThreshold
      ) {
        alerts.push({
          id: `alert-${groupId}-${balance.memberId}-owed-${now.getTime()}`,
          groupId,
          groupName,
          memberId: balance.memberId,
          memberName,
          type: 'owed_to_you',
          amount: Math.abs(balance.totalOwed),
          threshold: preferences.owedToYouThreshold,
          message: `${memberName} owes you $${Math.abs(balance.totalOwed).toFixed(2)} in ${groupName}`,
          severity: 'info',
          createdAt: now,
          acknowledged: false,
        });
      }

      // You owe alert (if checking for current member)
      if (
        currentMemberId &&
        preferences.showYouOweAlerts &&
        balance.memberId === currentMemberId &&
        balance.totalOwed > 0 &&
        balance.totalOwed >= preferences.youOweThreshold
      ) {
        alerts.push({
          id: `alert-${groupId}-${balance.memberId}-owe-${now.getTime()}`,
          groupId,
          groupName,
          memberId: balance.memberId,
          memberName,
          type: 'you_owe',
          amount: balance.totalOwed,
          threshold: preferences.youOweThreshold,
          message: `You owe $${balance.totalOwed.toFixed(2)} in ${groupName}`,
          severity: 'warning',
          createdAt: now,
          acknowledged: false,
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error(`Error checking balance alerts for group ${groupId}:`, error);
    return [];
  }
}

/**
 * Check for balance alerts across all groups
 */
export async function checkAllBalanceAlerts(
  groupIds: string[],
  groupNames: Map<string, string>,
  currentMemberId?: string
): Promise<BalanceAlert[]> {
  const allAlerts: BalanceAlert[] = [];
  
  for (const groupId of groupIds) {
    const groupName = groupNames.get(groupId) || 'Unknown Group';
    const alerts = await checkBalanceAlerts(groupId, groupName, currentMemberId);
    allAlerts.push(...alerts);
  }

  // Sort by severity and amount (most important first)
  return allAlerts.sort((a, b) => {
    const severityOrder = { error: 3, warning: 2, info: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return b.amount - a.amount;
  });
}

/**
 * Acknowledge an alert (mark as read)
 */
export function acknowledgeAlert(alertId: string): void {
  try {
    const acknowledged = JSON.parse(localStorage.getItem('acknowledged-balance-alerts') || '[]') as string[];
    if (!acknowledged.includes(alertId)) {
      acknowledged.push(alertId);
      localStorage.setItem('acknowledged-balance-alerts', JSON.stringify(acknowledged));
    }
  } catch (error) {
    console.error('Error acknowledging alert:', error);
  }
}

/**
 * Check if an alert is acknowledged
 */
export function isAlertAcknowledged(alertId: string): boolean {
  try {
    const acknowledged = JSON.parse(localStorage.getItem('acknowledged-balance-alerts') || '[]') as string[];
    return acknowledged.includes(alertId);
  } catch (error) {
    return false;
  }
}

/**
 * Clear all acknowledged alerts
 */
export function clearAcknowledgedAlerts(): void {
  localStorage.removeItem('acknowledged-balance-alerts');
}
