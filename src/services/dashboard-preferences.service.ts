/**
 * Dashboard Preferences Service
 * 
 * Manages user preferences for dashboard customization
 */

export interface DashboardWidget {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface DashboardPreferences {
  widgets: DashboardWidget[];
  defaultTab: number;
}

const STORAGE_KEY = 'dashboard-preferences';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'category-breakdown', label: 'Category Breakdown', visible: true, order: 0 },
  { id: 'spending-trends', label: 'Spending Trends', visible: true, order: 1 },
  { id: 'member-spending', label: 'Member Spending', visible: true, order: 2 },
  { id: 'time-analysis', label: 'Time Analysis', visible: true, order: 3 },
  { id: 'patterns', label: 'Expense Patterns', visible: true, order: 4 },
  { id: 'balance-analytics', label: 'Balance Analytics', visible: true, order: 5 },
];

const DEFAULT_PREFERENCES: DashboardPreferences = {
  widgets: DEFAULT_WIDGETS,
  defaultTab: 0,
};

/**
 * Get dashboard preferences from localStorage
 */
export function getDashboardPreferences(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all widgets are present
      const mergedWidgets = DEFAULT_WIDGETS.map((defaultWidget) => {
        const storedWidget = parsed.widgets?.find((w: DashboardWidget) => w.id === defaultWidget.id);
        return storedWidget || defaultWidget;
      });
      return {
        widgets: mergedWidgets.sort((a, b) => a.order - b.order),
        defaultTab: parsed.defaultTab ?? DEFAULT_PREFERENCES.defaultTab,
      };
    }
  } catch (error) {
    console.error('Error loading dashboard preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save dashboard preferences to localStorage
 */
export function saveDashboardPreferences(preferences: DashboardPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving dashboard preferences:', error);
  }
}

/**
 * Update widget visibility
 */
export function updateWidgetVisibility(widgetId: string, visible: boolean): void {
  const preferences = getDashboardPreferences();
  const widget = preferences.widgets.find((w) => w.id === widgetId);
  if (widget) {
    widget.visible = visible;
    saveDashboardPreferences(preferences);
  }
}

/**
 * Update widget order
 */
export function updateWidgetOrder(widgetIds: string[]): void {
  const preferences = getDashboardPreferences();
  widgetIds.forEach((id, index) => {
    const widget = preferences.widgets.find((w) => w.id === id);
    if (widget) {
      widget.order = index;
    }
  });
  saveDashboardPreferences(preferences);
}

/**
 * Reset dashboard preferences to defaults
 */
export function resetDashboardPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get visible widgets in order
 */
export function getVisibleWidgets(): DashboardWidget[] {
  const preferences = getDashboardPreferences();
  return preferences.widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);
}
