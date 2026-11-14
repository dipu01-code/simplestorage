// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { storage } from '../src/web';

describe('webAdapter without window (SSR)', () => {
  it('imports safely; reads are empty and writes throw STORAGE_UNAVAILABLE', async () => {
    expect(typeof window).toBe('undefined');
    expect(await storage.get('k')).toBeUndefined();
    expect(await storage.keys()).toEqual([]);
    await expect(storage.set('k', 1)).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
  });
});
