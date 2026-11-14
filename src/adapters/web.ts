import { StorageAdapter } from '../core/types';

function unavailableError(type: string): Error {
  const err = new Error(`${type}Storage is unavailable in this environment`);
  err.name = 'SecurityError';
  return err;
}

/** Browser adapter backed by localStorage (default) or sessionStorage. */
export function webAdapter(type: 'local' | 'session' = 'local'): StorageAdapter {
  let cached: Storage | null | undefined;

  // Never access window at module load or adapter creation — SSR-safe.
  // Resolution happens lazily on first method call.
  function getStore(): Storage | null {
    if (cached !== undefined) {
      return cached;
    }
    try {
      cached =
        typeof window !== 'undefined'
          ? (window[type === 'local' ? 'localStorage' : 'sessionStorage'] ?? null)
          : null;
    } catch {
      // Accessing storage throws in some sandboxed iframes / privacy modes.
      cached = null;
    }
    return cached;
  }

  return {
    async getItem(key: string): Promise<string | null> {
      return getStore()?.getItem(key) ?? null;
    },

    async setItem(key: string, value: string): Promise<void> {
      const store = getStore();
      if (!store) {
        throw unavailableError(type);
      }
      store.setItem(key, value);
    },

    async removeItem(key: string): Promise<void> {
      getStore()?.removeItem(key);
    },

    async clear(): Promise<void> {
      getStore()?.clear();
    },

    async getAllKeys(): Promise<string[]> {
      const store = getStore();
      if (!store) {
        return [];
      }
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
    },
  };
}
