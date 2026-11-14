// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage, webAdapter, storage } from '../src/web';

describe('webAdapter', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('default storage uses localStorage', async () => {
    await storage.set('user', { name: 'Dipu' });
    expect(localStorage.getItem('user')).toBe('{"name":"Dipu"}');
    expect(await storage.get('user')).toEqual({ name: 'Dipu' });
    expect(await storage.keys()).toEqual(['user']);
    await storage.clear();
    expect(localStorage.length).toBe(0);
  });

  it('session adapter uses sessionStorage', async () => {
    const s = createStorage({ adapter: webAdapter('session') });
    await s.set('tab', 1);
    expect(sessionStorage.getItem('tab')).toBe('1');
    expect(localStorage.getItem('tab')).toBeNull();
    await s.remove('tab');
    expect(sessionStorage.length).toBe(0);
  });
});
