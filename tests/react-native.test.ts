import { describe, it, expect, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', async () => {
  const map = new Map<string, string>();
  return {
    default: {
      getItem: async (k: string) => map.get(k) ?? null,
      setItem: async (k: string, v: string) => void map.set(k, v),
      removeItem: async (k: string) => void map.delete(k),
      clear: async () => map.clear(),
      getAllKeys: async () => [...map.keys()],
    },
  };
});

describe('react-native entry', () => {
  it('stores through AsyncStorage', async () => {
    const { storage } = await import('../src/react-native');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await storage.set('profile', { name: 'Dipu' });
    expect(await AsyncStorage.getItem('profile')).toBe('{"name":"Dipu"}');
    expect(await storage.get('profile')).toEqual({ name: 'Dipu' });
    expect(await storage.keys()).toEqual(['profile']);
    await storage.clear();
    expect(await storage.has('profile')).toBe(false);
  });
});
