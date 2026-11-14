import { describe, it, expect } from 'vitest';
import { createStorage, memoryAdapter, SimpleStoreError, type StorageAdapter } from '../src/index';

const failing = (err: Error): StorageAdapter => ({
  getItem: () => Promise.reject(err),
  setItem: () => Promise.reject(err),
  removeItem: () => Promise.reject(err),
  clear: () => Promise.reject(err),
  getAllKeys: () => Promise.reject(err),
});

async function code(p: Promise<unknown>) {
  const err = await p.then(
    () => null,
    (e) => e
  );
  expect(err).toBeInstanceOf(SimpleStoreError);
  return (err as SimpleStoreError).code;
}

describe('Storage', () => {
  it('round-trips JSON values', async () => {
    const s = createStorage({ adapter: memoryAdapter() });
    const profile = { name: 'Dipu', tags: ['a'], nested: { n: 1, ok: true, none: null } };
    await s.set('username', 'Dipu');
    await s.set('profile', profile);
    await s.set('zero', 0);
    expect(await s.get('username')).toBe('Dipu');
    expect(await s.get('profile')).toEqual(profile);
    expect(await s.get('zero')).toBe(0);
    expect(await s.has('profile')).toBe(true);
    expect((await s.keys()).sort()).toEqual(['profile', 'username', 'zero']);
  });

  it('returns undefined for missing keys and removes keys', async () => {
    const s = createStorage({ adapter: memoryAdapter() });
    expect(await s.get('nope')).toBeUndefined();
    expect(await s.has('nope')).toBe(false);
    await s.set('k', 1);
    await s.remove('k');
    expect(await s.has('k')).toBe(false);
    await s.set('k', 1);
    await s.clear();
    expect(await s.keys()).toEqual([]);
  });

  it('validates keys and values', async () => {
    const s = createStorage({ adapter: memoryAdapter() });
    expect(await code(s.set('', 1))).toBe('INVALID_KEY');
    expect(await code(s.get(42 as unknown as string))).toBe('INVALID_KEY');
    expect(await code(s.set('k', undefined))).toBe('UNSUPPORTED_VALUE');
    expect(await code(s.set('k', () => 1))).toBe('UNSUPPORTED_VALUE');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(await code(s.set('k', circular))).toBe('SERIALIZATION_ERROR');
  });

  it('reports malformed stored data', async () => {
    const adapter = memoryAdapter();
    await adapter.setItem('bad', '{not json');
    expect(await code(createStorage({ adapter }).get('bad'))).toBe('MALFORMED_DATA');
  });

  it('propagates adapter failures with mapped codes', async () => {
    const quota = new Error('full');
    quota.name = 'QuotaExceededError';
    expect(await code(createStorage({ adapter: failing(quota) }).set('k', 1))).toBe(
      'QUOTA_EXCEEDED'
    );
    const denied = new Error('nope');
    denied.name = 'SecurityError';
    expect(await code(createStorage({ adapter: failing(denied) }).get('k'))).toBe(
      'STORAGE_UNAVAILABLE'
    );
    const s = createStorage({ adapter: failing(new Error('disk')) });
    expect(await code(s.clear())).toBe('UNKNOWN_ERROR');
    expect(await code(s.keys())).toBe('UNKNOWN_ERROR');
  });

  it('multiSet / multiGet', async () => {
    const s = createStorage({ adapter: memoryAdapter() });
    await s.multiSet([
      ['a', 1],
      ['b', { x: 2 }],
    ]);
    expect(await s.multiGet(['a', 'b', 'c'])).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: { x: 2 } },
      { key: 'c', value: undefined },
    ]);
    // Validation happens before any write.
    expect(
      await code(
        s.multiSet([
          ['d', 1],
          ['', 2],
        ])
      )
    ).toBe('INVALID_KEY');
    expect(await s.has('d')).toBe(false);
  });

  it('prefix scopes keys() and clear() to the namespace', async () => {
    const adapter = memoryAdapter();
    await adapter.setItem('other-app', '1');
    const s = createStorage({ adapter, prefix: 'app:' });
    await s.set('user', 'Dipu');
    expect(await adapter.getItem('app:user')).toBe('"Dipu"');
    expect(await s.keys()).toEqual(['user']);
    await s.clear();
    expect(await s.keys()).toEqual([]);
    expect(await adapter.getItem('other-app')).toBe('1');
  });

  it('keys() errors clearly when the adapter has no getAllKeys', async () => {
    const { getAllKeys: _omit, ...adapter } = memoryAdapter();
    const s = createStorage({ adapter });
    expect(await code(s.keys())).toBe('UNKNOWN_ERROR');
  });
});
