import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '@/lib/token-store';
import { getOrCreateSessionId } from '@/lib/session';
import { searchMergeRequests } from '@/lib/gitlab';
import type { SearchRequest, SearchResponse, SearchMergeRequest } from '@/types/search';

export const runtime = 'nodejs';

function extractProjectPathFromUrl(webUrl: string): string {
  try {
    const url = new URL(webUrl);
    const pathParts = url.pathname.split('/-/');
    if (pathParts.length > 0) {
      return pathParts[0]?.slice(1) ?? '';
    }
    return '';
  } catch {
    return '';
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SearchResponse | { error: string }>> {
  try {
    const sessionId = await getOrCreateSessionId();

    const token = await tokenStore.get(sessionId);
    if (!token) {
      return NextResponse.json({ error: 'No token found. Please save a token first.' }, { status: 401 });
    }

    const body = (await request.json()) as SearchRequest;

    if (!body.authorUsernames || body.authorUsernames.length === 0) {
      return NextResponse.json(
        { error: 'authorUsernames must be non-empty' },
        { status: 400 },
      );
    }

    if (!body.state || !['opened', 'merged', 'closed'].includes(body.state)) {
      return NextResponse.json(
        { error: 'state must be one of: opened, merged, closed' },
        { status: 400 },
      );
    }

    const perPage = body.perPage ?? 50;
    const mrs = await searchMergeRequests(body.authorUsernames, body.state, token, perPage);

    const searchMRs: SearchMergeRequest[] = mrs.map((mr) => {
      const projectPath = extractProjectPathFromUrl(mr.web_url);
      const state = mr.state.toLowerCase() as 'opened' | 'merged' | 'closed';

      return {
        id: mr.id,
        iid: mr.iid,
        projectId: mr.project_id,
        projectPath,
        title: mr.title,
        webUrl: mr.web_url,
        state,
        author: {
          username: mr.author.username,
          name: mr.author.name,
          avatarUrl: mr.author.avatar_url,
        },
        createdAt: mr.created_at,
        updatedAt: mr.updated_at,
        mergedAt: mr.merged_at,
        userNotesCount: mr.user_notes_count ?? 0,
        upvotes: mr.upvotes ?? 0,
        downvotes: mr.downvotes ?? 0,
      };
    });

    const response: SearchResponse = {
      mergeRequests: searchMRs,
      state: body.state,
    };

    return NextResponse.json(response);
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
