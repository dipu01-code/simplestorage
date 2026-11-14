// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { createStorage, memoryAdapter } from '../src/index';
import { useStorage, type UseStorageResult } from '../src/react';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('useStorage', () => {
  it('loads, sets and removes a value', async () => {
    const storage = createStorage({ adapter: memoryAdapter() });
    await storage.set('count', 5);
    let hook!: UseStorageResult<number>;
    function Probe() {
      hook = useStorage<number>(storage, 'count', 0);
      return null;
    }
    const root = createRoot(document.createElement('div'));
    await act(async () => root.render(createElement(Probe)));
    expect(hook.loading).toBe(false);
    expect(hook.value).toBe(5);

    await act(() => hook.set(6));
    expect(hook.value).toBe(6);
    expect(await storage.get('count')).toBe(6);

    await act(() => hook.remove());
    expect(hook.value).toBeUndefined();
    expect(await storage.has('count')).toBe(false);
    act(() => root.unmount());
  });

  it('uses initialValue for missing keys', async () => {
    const storage = createStorage({ adapter: memoryAdapter() });
    let hook!: UseStorageResult<string>;
    function Probe() {
      hook = useStorage(storage, 'missing', 'fallback');
      return null;
    }
    const root = createRoot(document.createElement('div'));
    await act(async () => root.render(createElement(Probe)));
    expect(hook.value).toBe('fallback');
    expect(hook.error).toBeUndefined();
    act(() => root.unmount());
  });
});
