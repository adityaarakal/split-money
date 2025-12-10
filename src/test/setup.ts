/**
 * Vitest Test Setup
 * 
 * Global test configuration and mocks
 */

import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage for migrations
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock localforage for tests
vi.mock('localforage', () => {
  const stores = new Map<string, Map<string, unknown>>();
  
  const createInstance = () => {
    const storeName = `test-store-${Math.random().toString(36).substring(7)}`;
    const store = new Map<string, unknown>();
    stores.set(storeName, store);
    
    return {
      ready: vi.fn().mockResolvedValue(undefined),
      getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: vi.fn((key: string, value: unknown) => {
        store.set(key, value);
        return Promise.resolve(value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
        return Promise.resolve(undefined);
      }),
      clear: vi.fn(() => {
        store.clear();
        return Promise.resolve(undefined);
      }),
      length: vi.fn(() => Promise.resolve(store.size)),
      key: vi.fn((index: number) => {
        const keys = Array.from(store.keys());
        return Promise.resolve(keys[index] ?? null);
      }),
      keys: vi.fn(() => Promise.resolve(Array.from(store.keys()))),
    };
  };
  
  return {
    default: {
      createInstance,
    },
    createInstance,
  };
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  // Clear localStorage mock
  localStorageMock.clear();
});
