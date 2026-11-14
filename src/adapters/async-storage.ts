import { StorageAdapter } from '../core/types';

/** The subset of @react-native-async-storage/async-storage this adapter uses. */
export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}

/** React Native / Expo adapter. Takes the AsyncStorage instance so this file never imports react-native itself. */
export function asyncStorageAdapter(asyncStorage: AsyncStorageLike): StorageAdapter {
  return {
    getItem: (key) => asyncStorage.getItem(key),
    setItem: (key, value) => asyncStorage.setItem(key, value),
    removeItem: (key) => asyncStorage.removeItem(key),
    clear: () => asyncStorage.clear(),
    getAllKeys: async () => [...(await asyncStorage.getAllKeys())],
  };
}
