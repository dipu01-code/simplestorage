import { createStorage } from './core/storage';
import { webAdapter } from './adapters/web';

export * from './index';
export { webAdapter };

/** Ready-to-use localStorage-backed storage. */
export const storage = createStorage({ adapter: webAdapter() });
