import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const SESSION_COOKIE_NAME = 'glmr_sid';
const SESSION_ID_BYTES = 32;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function generateSessionId(): string {
  return randomBytes(SESSION_ID_BYTES).toString('base64url');
}

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME);

  if (existing?.value) {
    return existing.value;
  }

  const sessionId = generateSessionId();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return sessionId;
}

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value ?? null;
}
