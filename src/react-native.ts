import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorage } from './core/storage';
import { asyncStorageAdapter } from './adapters/async-storage';

export * from './index';
export { asyncStorageAdapter };
export type { AsyncStorageLike } from './adapters/async-storage';

/** Ready-to-use AsyncStorage-backed storage. */
export const storage = createStorage({ adapter: asyncStorageAdapter(AsyncStorage) });
