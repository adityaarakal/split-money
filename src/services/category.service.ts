/**
 * Category Service
 * Manages expense categories (custom and default)
 */

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Travel',
  'Health & Fitness',
  'Education',
  'Other',
];

const STORAGE_KEY = 'expense_categories';

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
}

/**
 * Get all categories (default + custom)
 */
export function getAllCategories(): Category[] {
  const customCategories = getCustomCategories();
  const defaultCategories: Category[] = DEFAULT_CATEGORIES.map((name, index) => ({
    id: `default-${index}`,
    name,
    isDefault: true,
    createdAt: new Date(0),
  }));
  
  return [...defaultCategories, ...customCategories];
}

/**
 * Get category names as array of strings
 */
export function getCategoryNames(): string[] {
  return getAllCategories().map((cat) => cat.name);
}

/**
 * Get custom categories from storage
 */
export function getCustomCategories(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored) as Array<{ id: string; name: string; isDefault: boolean; createdAt: string }>;
    return data.map((cat) => ({
      ...cat,
      createdAt: new Date(cat.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Add a custom category
 */
export function addCustomCategory(name: string): Category {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Category name cannot be empty');
  }

  const existing = getAllCategories();
  if (existing.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('Category already exists');
  }

  const newCategory: Category = {
    id: `custom-${Date.now()}`,
    name: trimmedName,
    isDefault: false,
    createdAt: new Date(),
  };

  const customCategories = getCustomCategories();
  customCategories.push(newCategory);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));

  return newCategory;
}

/**
 * Delete a custom category
 */
export function deleteCustomCategory(categoryId: string): void {
  const customCategories = getCustomCategories();
  const filtered = customCategories.filter((cat) => cat.id !== categoryId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update a custom category name
 */
export function updateCustomCategory(categoryId: string, newName: string): Category {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    throw new Error('Category name cannot be empty');
  }

  const customCategories = getCustomCategories();
  const index = customCategories.findIndex((cat) => cat.id === categoryId);
  
  if (index === -1) {
    throw new Error('Category not found');
  }

  // Check for duplicates
  const allCategories = getAllCategories();
  if (allCategories.some((cat) => cat.id !== categoryId && cat.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('Category name already exists');
  }

  customCategories[index].name = trimmedName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));

  return customCategories[index];
}

