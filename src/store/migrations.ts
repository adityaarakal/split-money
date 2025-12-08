/**
 * Database Migrations
 * 
 * Handles database schema migrations and versioning
 */

const MIGRATION_VERSION_KEY = 'db_version';
const CURRENT_DB_VERSION = 1;

/**
 * Get current database version
 */
export async function getCurrentVersion(): Promise<number> {
  try {
    const version = localStorage.getItem(MIGRATION_VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set database version
 */
export async function setCurrentVersion(version: number): Promise<void> {
  try {
    localStorage.setItem(MIGRATION_VERSION_KEY, version.toString());
  } catch (error) {
    console.error('Failed to set database version:', error);
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion();
    
    if (currentVersion >= CURRENT_DB_VERSION) {
      return; // Already up to date
    }

    // Run migrations sequentially
    for (let version = currentVersion + 1; version <= CURRENT_DB_VERSION; version++) {
      await runMigration(version);
      await setCurrentVersion(version);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw new Error(`Database migration failed: ${error}`);
  }
}

/**
 * Run a specific migration
 */
async function runMigration(version: number): Promise<void> {
  switch (version) {
    case 1:
      // Initial migration - database is already initialized by localforage
      // This is a placeholder for future migrations
      console.log('Running migration 1: Initial schema');
      break;
    default:
      console.warn(`Unknown migration version: ${version}`);
  }
}

