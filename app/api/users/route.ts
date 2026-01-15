import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '@/lib/token-store';
import { getOrCreateSessionId } from '@/lib/session';
import { searchUsers } from '@/lib/gitlab';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<{ users: Array<{ id: number; username: string; name: string; avatarUrl?: string }> } | { error: string }>> {
  try {
    const sessionId = await getOrCreateSessionId();

    const token = await tokenStore.get(sessionId);
    if (!token) {
      return NextResponse.json({ error: 'No token found. Please save a token first.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    if (!search || search.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await searchUsers(search.trim(), token);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        avatarUrl: u.avatar_url,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
      if (error.message.includes('forbidden')) {
        return NextResponse.json({ error: 'Access forbidden' }, { status: 403 });
      }
      if (error.message.includes('Invalid GitLab token')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
