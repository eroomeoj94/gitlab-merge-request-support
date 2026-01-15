import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const TOKEN_TTL_DAYS = parseInt(process.env.TOKEN_TTL_DAYS ?? '7', 10);
const TOKEN_TTL_MS = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

type StoredToken = {
  encryptedToken: string;
  expiresAt: number;
};

const tokenCache = new Map<string, StoredToken>();

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.TOKEN_ENC_KEY_BASE64;
  if (!keyBase64) {
    throw new Error('TOKEN_ENC_KEY_BASE64 environment variable is required');
  }

  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('TOKEN_ENC_KEY_BASE64 must be 32 bytes (base64 encoded)');
  }

  return key;
}

function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

function decryptToken(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivBase64, authTagBase64, encrypted] = encryptedData.split(':');

  if (!ivBase64 || !authTagBase64 || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [sessionId, stored] of tokenCache.entries()) {
    if (stored.expiresAt < now) {
      tokenCache.delete(sessionId);
    }
  }
}

export function storeToken(sessionId: string, token: string): void {
  cleanupExpired();

  const encryptedToken = encryptToken(token);
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  tokenCache.set(sessionId, { encryptedToken, expiresAt });
}

export function getToken(sessionId: string): string | null {
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
  } catch (error) {
    tokenCache.delete(sessionId);
    return null;
  }
}

export function deleteToken(sessionId: string): void {
  tokenCache.delete(sessionId);
}
