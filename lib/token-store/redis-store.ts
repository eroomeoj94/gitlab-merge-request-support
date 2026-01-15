import Redis from 'ioredis';
import type { TokenStore } from './types';
import { encryptToken, decryptToken } from './encryption';

const TOKEN_TTL_DAYS = parseInt(process.env.TOKEN_TTL_DAYS ?? '7', 10);
const TOKEN_TTL_SECONDS = TOKEN_TTL_DAYS * 24 * 60 * 60;

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required for Redis token store');
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

export function createRedisStore(): TokenStore {
  const redis = createRedisClient();

  return {
    async store(sessionId: string, token: string): Promise<void> {
      const encryptedToken = encryptToken(token);
      const key = `token:${sessionId}`;

      await redis.setex(key, TOKEN_TTL_SECONDS, encryptedToken);
    },

    async get(sessionId: string): Promise<string | null> {
      const key = `token:${sessionId}`;
      const encryptedToken = await redis.get(key);

      if (!encryptedToken) {
        return null;
      }

      try {
        return decryptToken(encryptedToken);
      } catch {
        // If decryption fails, delete the corrupted token
        await redis.del(key);
        return null;
      }
    },

    async delete(sessionId: string): Promise<void> {
      const key = `token:${sessionId}`;
      await redis.del(key);
    },
  };
}
