/**
 * Base Repository Pattern
 * 
 * Provides common CRUD operations for all repositories
 */

export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

/**
 * Base repository implementation using localforage
 */
export abstract class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected store: LocalForage;

  constructor(store: LocalForage) {
    this.store = store;
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    try {
      const keys = await this.store.keys();
      const entities = await Promise.all(
        keys.map((key) => this.store.getItem<T>(key))
      );
      return entities.filter((entity) => entity !== null && entity !== undefined) as T[];
    } catch (error) {
      console.error(`Error getting all entities:`, error);
      throw new Error(`Failed to get all entities: ${error}`);
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      return await this.store.getItem<T>(id);
    } catch (error) {
      console.error(`Error getting entity by ID ${id}:`, error);
      throw new Error(`Failed to get entity: ${error}`);
    }
  }

  /**
   * Create new entity
   */
  async create(entity: T): Promise<T> {
    try {
      await this.store.setItem(entity.id, entity);
      return entity;
    } catch (error) {
      console.error(`Error creating entity:`, error);
      throw new Error(`Failed to create entity: ${error}`);
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      const updated = { ...existing, ...updates, id };
      await this.store.setItem(id, updated);
      return updated;
    } catch (error) {
      console.error(`Error updating entity ${id}:`, error);
      throw new Error(`Failed to update entity: ${error}`);
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<void> {
    try {
      await this.store.removeItem(id);
    } catch (error) {
      console.error(`Error deleting entity ${id}:`, error);
      throw new Error(`Failed to delete entity: ${error}`);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.getById(id);
      return entity !== null;
    } catch (error) {
      return false;
    }
  }
}

