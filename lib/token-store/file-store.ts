import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { StoredToken, TokenStore } from './types';
import { encryptToken, decryptToken } from './encryption';

const TOKEN_TTL_DAYS = parseInt(process.env.TOKEN_TTL_DAYS ?? '7', 10);
const TOKEN_TTL_MS = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const TOKEN_FILE = join(process.cwd(), '.data', 'tokens.json');

function ensureDataDir(): void {
  const dir = join(process.cwd(), '.data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadTokens(): Map<string, StoredToken> {
  try {
    if (existsSync(TOKEN_FILE)) {
      const data = JSON.parse(readFileSync(TOKEN_FILE, 'utf8')) as Record<string, StoredToken>;
      return new Map(Object.entries(data));
    }
  } catch {
    // File corrupted or doesn't exist, return empty map
  }
  return new Map();
}

function saveTokens(cache: Map<string, StoredToken>): void {
  ensureDataDir();
  writeFileSync(TOKEN_FILE, JSON.stringify(Object.fromEntries(cache), null, 2), 'utf8');
}

function cleanupExpired(cache: Map<string, StoredToken>): void {
  const now = Date.now();
  for (const [sessionId, stored] of cache.entries()) {
    if (stored.expiresAt < now) {
      cache.delete(sessionId);
    }
  }
}

export function createFileStore(): TokenStore {
  return {
    async store(sessionId: string, token: string): Promise<void> {
      const cache = loadTokens();
      cleanupExpired(cache);

      const encryptedToken = encryptToken(token);
      const expiresAt = Date.now() + TOKEN_TTL_MS;

      cache.set(sessionId, { encryptedToken, expiresAt });
      saveTokens(cache);
    },

    async get(sessionId: string): Promise<string | null> {
      const cache = loadTokens();
      cleanupExpired(cache);

      const stored = cache.get(sessionId);
      if (!stored) {
        return null;
      }

      if (stored.expiresAt < Date.now()) {
        cache.delete(sessionId);
        saveTokens(cache);
        return null;
      }

      try {
        return decryptToken(stored.encryptedToken);
      } catch {
        cache.delete(sessionId);
        saveTokens(cache);
        return null;
      }
    },

    async delete(sessionId: string): Promise<void> {
      const cache = loadTokens();
      cache.delete(sessionId);
      saveTokens(cache);
    },
  };
}
