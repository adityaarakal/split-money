/**
 * Backup & Restore E2E Tests
 * 
 * Tests for backup and restore functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Backup & Restore', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should export backup data', async ({ page }) => {
    // Create a test group first
    await page.click('button:has-text("Create Group")');
    await page.fill('input[name="name"]', 'Test Group for Backup');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button:has-text("Create")');
    
    // Wait for group to be created
    await page.waitForSelector('text=Test Group for Backup');
    
    // Open backup/restore dialog
    // Assuming there's a button or menu item to open backup dialog
    // This might need to be adjusted based on actual UI
    await page.click('button[aria-label*="Backup"], button:has-text("Backup"), button:has-text("Settings")');
    
    // Wait for dialog to open
    await page.waitForSelector('text=Backup & Restore');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Backup"), button:has-text("Download Backup")');
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('split-money-backup');
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    
    // Verify file content
    const path = await download.path();
    if (path) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const content = fs.readFileSync(path, 'utf-8');
      const backup = JSON.parse(content);
      
      expect(backup).toHaveProperty('version');
      expect(backup).toHaveProperty('exportedAt');
      expect(backup).toHaveProperty('groups');
      expect(backup).toHaveProperty('members');
      expect(backup).toHaveProperty('expenses');
      expect(backup).toHaveProperty('expenseSplits');
      
      // Verify test group is in backup
      const testGroup = backup.groups.find((g: { name: string }) => g.name === 'Test Group for Backup');
      expect(testGroup).toBeDefined();
    }
  });

  test('should import backup data', async ({ page }) => {
    // Create a backup file first
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      groups: [
        {
          id: 'imported-group-1',
          name: 'Imported Group',
          description: 'Imported Description',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      members: [],
      expenses: [],
      expenseSplits: [],
    };
    
    // Open backup/restore dialog
    await page.click('button[aria-label*="Backup"], button:has-text("Backup"), button:has-text("Settings")');
    await page.waitForSelector('text=Backup & Restore');
    
    // Create a file input and upload backup
    const fileInput = await page.locator('input[type="file"]');
    
    // Create a temporary file for upload
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tempDir = require('os').tmpdir();
    const tempFile = path.join(tempDir, `backup-${Date.now()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(backupData, null, 2));
    
    await fileInput.setInputFiles(tempFile);
    
    // Handle confirmation dialog (if any)
    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'confirm') {
        await dialog.accept(); // Accept to clear existing data
      }
    });
    
    // Wait for import to complete
    await page.waitForSelector('text=Backup imported successfully', { timeout: 10000 });
    
    // Verify imported group appears
    await page.waitForSelector('text=Imported Group');
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  });

  test('should handle invalid backup file', async ({ page }) => {
    // Open backup/restore dialog
    await page.click('button[aria-label*="Backup"], button:has-text("Backup"), button:has-text("Settings")');
    await page.waitForSelector('text=Backup & Restore');
    
    // Create an invalid backup file
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tempDir = require('os').tmpdir();
    const tempFile = path.join(tempDir, `invalid-backup-${Date.now()}.json`);
    fs.writeFileSync(tempFile, '{ invalid json }');
    
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempFile);
    
    // Should show error message
    await page.waitForSelector('text=Failed to import backup, text=Invalid backup format', { timeout: 5000 });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  });

  test('should handle empty backup file', async ({ page }) => {
    // Open backup/restore dialog
    await page.click('button[aria-label*="Backup"], button:has-text("Backup"), button:has-text("Settings")');
    await page.waitForSelector('text=Backup & Restore');
    
    // Create an empty backup file
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tempDir = require('os').tmpdir();
    const tempFile = path.join(tempDir, `empty-backup-${Date.now()}.json`);
    fs.writeFileSync(tempFile, '{}');
    
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempFile);
    
    // Should show error message
    await page.waitForSelector('text=Failed to import backup, text=Invalid backup format', { timeout: 5000 });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  });
});
