import type { StoredToken, TokenStore } from './types';
import { encryptToken, decryptToken } from './encryption';

const TOKEN_TTL_DAYS = parseInt(process.env.TOKEN_TTL_DAYS ?? '7', 10);
const TOKEN_TTL_MS = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const tokenCache = new Map<string, StoredToken>();

function cleanupExpired(): void {
  const now = Date.now();
  for (const [sessionId, stored] of tokenCache.entries()) {
    if (stored.expiresAt < now) {
      tokenCache.delete(sessionId);
    }
  }
}

export function createMemoryStore(): TokenStore {
  return {
    async store(sessionId: string, token: string): Promise<void> {
      cleanupExpired();

      const encryptedToken = encryptToken(token);
      const expiresAt = Date.now() + TOKEN_TTL_MS;

      tokenCache.set(sessionId, { encryptedToken, expiresAt });

      // Verify storage immediately
      const stored = tokenCache.get(sessionId);
      if (!stored) {
        throw new Error('Failed to store token: token was not found in cache after storage');
      }
    },

    async get(sessionId: string): Promise<string | null> {
      cleanupExpired();

      const stored = tokenCache.get(sessionId);
      if (!stored) {
        return null;
      }

      if (stored.expiresAt < Date.now()) {
        tokenCache.delete(sessionId);
        return null;
      }

      try {
        return decryptToken(stored.encryptedToken);
      } catch {
        tokenCache.delete(sessionId);
        return null;
      }
    },

    async delete(sessionId: string): Promise<void> {
      tokenCache.delete(sessionId);
    },
  };
}
