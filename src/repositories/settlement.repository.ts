/**
 * Settlement Repository
 * 
 * Manages settlement data in IndexedDB
 */

import { BaseRepository } from './base.repository';
import { settlementsStore } from '../store/database';
import type { Settlement } from '../types/settlement';

class SettlementRepository extends BaseRepository<Settlement> {
  constructor() {
    super(settlementsStore);
  }

  /**
   * Get all settlements for a group
   */
  async getByGroupId(groupId: string): Promise<Settlement[]> {
    const all = await this.getAll();
    return all.filter((settlement) => settlement.groupId === groupId);
  }

  /**
   * Get settlements involving a specific member
   */
  async getByMemberId(memberId: string): Promise<Settlement[]> {
    const all = await this.getAll();
    return all.filter(
      (settlement) =>
        settlement.fromMemberId === memberId || settlement.toMemberId === memberId
    );
  }

  /**
   * Get settlements between two members
   */
  async getBetweenMembers(
    memberId1: string,
    memberId2: string,
    groupId: string
  ): Promise<Settlement[]> {
    const groupSettlements = await this.getByGroupId(groupId);
    return groupSettlements.filter(
      (settlement) =>
        (settlement.fromMemberId === memberId1 && settlement.toMemberId === memberId2) ||
        (settlement.fromMemberId === memberId2 && settlement.toMemberId === memberId1)
    );
  }
}

export const settlementRepository = new SettlementRepository();

