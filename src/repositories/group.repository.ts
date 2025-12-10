/**
 * Group Repository
 * 
 * Handles all Group entity operations
 */

import { BaseRepository } from './base.repository';
import { groupsStore } from '../store/database';
import type { Group } from '../types';
import { validateGroup } from '../utils/validation/validators';

export class GroupRepository extends BaseRepository<Group> {
  constructor() {
    super(groupsStore);
  }

  /**
   * Create a new group with validation
   */
  async create(group: Group): Promise<Group> {
    const validation = validateGroup(group);
    if (!validation.valid) {
      throw new Error(`Invalid group: ${validation.errors.join(', ')}`);
    }
    return super.create(group);
  }

  /**
   * Update group with validation
   */
  async update(id: string, updates: Partial<Group>): Promise<Group> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Group with ID ${id} not found`);
    }
    
    const updated = { ...existing, ...updates, id, updatedAt: new Date() };
    const validation = validateGroup(updated);
    if (!validation.valid) {
      throw new Error(`Invalid group: ${validation.errors.join(', ')}`);
    }
    
    return super.update(id, updated);
  }

  /**
   * Get groups by name (search)
   */
  async searchByName(searchTerm: string): Promise<Group[]> {
    const allGroups = await this.getAll();
    const lowerSearch = searchTerm.toLowerCase();
    return allGroups.filter(
      (group) => group.name.toLowerCase().includes(lowerSearch)
    );
  }
}

// Export singleton instance
export const groupRepository = new GroupRepository();



