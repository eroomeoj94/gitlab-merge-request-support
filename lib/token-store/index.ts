import type { TokenStore } from './types';
import { createMemoryStore } from './memory-store';
import { createFileStore } from './file-store';
import { createRedisStore } from './redis-store';

let tokenStoreInstance: TokenStore | null = null;

function createTokenStore(): TokenStore {
  // Priority 1: Redis if REDIS_URL is set
  if (process.env.REDIS_URL) {
    try {
      return createRedisStore();
    } catch (error) {
      console.error('Failed to create Redis store, falling back to file store:', error);
      // Fall through to file store
    }
  }

  // Priority 2: File store for development
  if (process.env.NODE_ENV === 'development') {
    return createFileStore();
  }

  // Priority 3: Memory store as fallback (with warning)
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'WARNING: Using in-memory token store in production. Tokens will be lost on restart. Set REDIS_URL for persistent storage.',
    );
  }

  return createMemoryStore();
}

export function getTokenStore(): TokenStore {
  if (!tokenStoreInstance) {
    tokenStoreInstance = createTokenStore();
  }
  return tokenStoreInstance;
}

// Export singleton instance
export const tokenStore = getTokenStore();

// Re-export types for convenience
export type { TokenStore, StoredToken } from './types';
