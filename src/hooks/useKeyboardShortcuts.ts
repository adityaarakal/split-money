/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard shortcut functionality throughout the application
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined ? true : event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined ? true : event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined ? true : event.altKey === shortcut.altKey;
        const metaMatch = shortcut.metaKey === undefined ? true : event.metaKey === shortcut.metaKey;

        // Don't trigger if user is typing in an input field
        const isInputFocused =
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLElement && event.target.isContentEditable);

        if (
          keyMatch &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch &&
          !isInputFocused
        ) {
          event.preventDefault();
          shortcut.handler();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Common keyboard shortcuts
export const commonShortcuts: Record<string, KeyboardShortcut> = {
  createGroup: {
    key: 'n',
    ctrlKey: true,
    handler: () => {
      // This will be handled by the component using the hook
    },
    description: 'Create new group',
  },
  createExpense: {
    key: 'e',
    ctrlKey: true,
    handler: () => {
      // This will be handled by the component using the hook
    },
    description: 'Create new expense',
  },
  search: {
    key: 'k',
    ctrlKey: true,
    handler: () => {
      // This will be handled by the component using the hook
    },
    description: 'Focus search',
  },
  toggleTheme: {
    key: 't',
    ctrlKey: true,
    shiftKey: true,
    handler: () => {
      // This will be handled by the component using the hook
    },
    description: 'Toggle theme',
  },
};

