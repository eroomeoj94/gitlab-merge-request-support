import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/token-store';
import { getOrCreateSessionId } from '@/lib/session';
import { getMyProjects } from '@/lib/gitlab';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<{ projects: Array<{ id: number; name: string; pathWithNamespace: string }> } | { error: string }>> {
  try {
    const sessionId = await getOrCreateSessionId();

    const token = getToken(sessionId);
    if (!token) {
      return NextResponse.json({ error: 'No token found. Please save a token first.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const projects = await getMyProjects(token, search ?? undefined);

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        pathWithNamespace: p.path_with_namespace,
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
