/**
 * Member Repository
 * 
 * Handles all Member entity operations
 */

import { BaseRepository } from './base.repository';
import { membersStore } from '../store/database';
import type { Member } from '../types';
import { validateMember } from '../utils/validation/validators';

export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super(membersStore);
  }

  /**
   * Create a new member with validation
   */
  async create(member: Member): Promise<Member> {
    const validation = validateMember(member);
    if (!validation.valid) {
      throw new Error(`Invalid member: ${validation.errors.join(', ')}`);
    }
    return super.create(member);
  }

  /**
   * Update member with validation
   */
  async update(id: string, updates: Partial<Member>): Promise<Member> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Member with ID ${id} not found`);
    }
    
    const updated = { ...existing, ...updates, id };
    const validation = validateMember(updated);
    if (!validation.valid) {
      throw new Error(`Invalid member: ${validation.errors.join(', ')}`);
    }
    
    return super.update(id, updated);
  }

  /**
   * Get all members in a group
   */
  async getByGroupId(groupId: string): Promise<Member[]> {
    const allMembers = await this.getAll();
    return allMembers.filter((member) => member.groupId === groupId);
  }

  /**
   * Check if member exists in group
   */
  async existsInGroup(memberId: string, groupId: string): Promise<boolean> {
    const member = await this.getById(memberId);
    return member !== null && member.groupId === groupId;
  }
}

// Export singleton instance
export const memberRepository = new MemberRepository();


