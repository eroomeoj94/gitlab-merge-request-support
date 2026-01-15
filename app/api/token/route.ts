import { NextRequest, NextResponse } from 'next/server';
import { deleteToken, storeToken } from '@/lib/token-store';
import { getOrCreateSessionId } from '@/lib/session';
import { validateToken } from '@/lib/gitlab';
import type { DeleteTokenResponse, SaveTokenRequest, SaveTokenResponse } from '@/types/report';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse<SaveTokenResponse>> {
  try {
    let body: SaveTokenRequest;
    try {
      body = (await request.json()) as SaveTokenRequest;
    } catch (parseError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    if (!body.token || typeof body.token !== 'string' || body.token.trim() === '') {
      return NextResponse.json(
        { ok: false, error: 'Token is required' },
        { status: 400 },
      );
    }

    const sessionId = await getOrCreateSessionId();
    const user = await validateToken(body.token);

    try {
      storeToken(sessionId, body.token);
    } catch (storeError) {
      if (storeError instanceof Error) {
        if (storeError.message.includes('TOKEN_ENC_KEY_BASE64')) {
          return NextResponse.json(
            { ok: false, error: 'Server configuration error: encryption key not set' },
            { status: 500 },
          );
        }
      }
      throw storeError;
    }

    const ttlDays = parseInt(process.env.TOKEN_TTL_DAYS ?? '7', 10);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      ok: true,
      expiresAt,
      user: {
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid GitLab token' || error.message.includes('Invalid token')) {
        return NextResponse.json(
          { ok: false, error: 'Invalid token' },
          { status: 401 },
        );
      }
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          { ok: false, error: 'GitLab API endpoint not found' },
          { status: 404 },
        );
      }
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        return NextResponse.json(
          { ok: false, error: 'Access forbidden' },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function DELETE(): Promise<NextResponse<DeleteTokenResponse>> {
  try {
    const sessionId = await getOrCreateSessionId();
    deleteToken(sessionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: true },
      { status: 200 },
    );
  }
}
