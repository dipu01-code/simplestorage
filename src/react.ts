import { useCallback, useEffect, useState } from 'react';
import type { StorageInterface } from './core/types';

export interface UseStorageResult<T> {
  value: T | undefined;
  set: (value: T) => Promise<void>;
  remove: () => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Reads `key` from `storage` and keeps it in React state. `initialValue` is
 * returned while loading and when the key is missing (it is not written).
 */
// shortcut: two components using the same key don't sync with each other; add a subscription if needed.
export function useStorage<T>(
  storage: StorageInterface,
  key: string,
  initialValue?: T
): UseStorageResult<T> {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    storage.get<T>(key).then(
      (stored) => {
        if (!active) return;
        setValue(stored === undefined ? initialValue : stored);
        setError(undefined);
        setLoading(false);
      },
      (err: Error) => {
        if (!active) return;
        setError(err);
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
    // initialValue is intentionally excluded: callers often pass a fresh object literal.
  }, [storage, key]);

  const set = useCallback(
    async (next: T) => {
      await storage.set(key, next);
      setValue(next);
    },
    [storage, key]
  );

  const remove = useCallback(async () => {
    await storage.remove(key);
    setValue(undefined);
  }, [storage, key]);

  return { value, set, remove, loading, error };
}
