import { StorageAdapter } from '../core/types';

/** In-memory adapter for tests, SSR and temporary data. Data is lost when the process ends. */
export function memoryAdapter(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
    async clear() {
      map.clear();
    },
    async getAllKeys() {
      return [...map.keys()];
    },
  };
}
