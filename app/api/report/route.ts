import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '@/lib/token-store';
import { getOrCreateSessionId } from '@/lib/session';
import {
  getMergedMRs,
  getMRChanges,
  getMRDetails,
} from '@/lib/gitlab';
import { computeMetrics, computeScore, getSizeBand } from '@/lib/scoring';
import { average, groupByAuthor, median, promisePool } from '@/lib/stats';
import type { GitLabMergeRequest } from '@/types/gitlab';
import type { ReportRequest, ReportResponse } from '@/types/report';

export const runtime = 'nodejs';

const REPORT_MAX_MRS = parseInt(process.env.REPORT_MAX_MRS ?? '500', 10);

function isDraft(title: string): boolean {
  return /^(draft:|wip:)/i.test(title.trim());
}

async function fetchMRWithMetrics(
  mr: GitLabMergeRequest,
  token: string,
): Promise<ReportResponse['mergeRequests'][0]> {
  let metrics = { additions: 0, deletions: 0, linesChanged: 0, filesChanged: 0, dirsTouched: 0 };

  try {
    const changesResponse = await getMRChanges(mr.project_id, mr.iid, token);
    metrics = computeMetrics(changesResponse.changes);
  } catch (error) {
    try {
      const details = await getMRDetails(mr.project_id, mr.iid, token);
      if (details.additions !== undefined && details.deletions !== undefined) {
        metrics = {
          additions: details.additions,
          deletions: details.deletions,
          linesChanged: details.additions + details.deletions,
          filesChanged: 0,
          dirsTouched: 0,
        };
      }
    } catch {
      metrics = { additions: 0, deletions: 0, linesChanged: 0, filesChanged: 0, dirsTouched: 0 };
    }
  }

  const score = computeScore(metrics);
  const sizeBand = getSizeBand(score);

  // Calculate days open (created_at to merged_at)
  const daysOpen =
    mr.created_at && mr.merged_at
      ? (new Date(mr.merged_at).getTime() - new Date(mr.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 0;

  return {
    projectId: mr.project_id,
    iid: mr.iid,
    title: mr.title,
    webUrl: mr.web_url,
    author: {
      username: mr.author.username,
      name: mr.author.name,
    },
    mergedAt: mr.merged_at ?? mr.updated_at,
    daysOpen,
    metrics,
    score,
    sizeBand,
  };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ReportResponse | { error: string }>> {
  try {
    const sessionId = await getOrCreateSessionId();

    const token = await tokenStore.get(sessionId);
    if (!token) {
      return NextResponse.json({ error: 'No token found. Please save a token first.' }, { status: 401 });
    }

    const body = (await request.json()) as ReportRequest;

    if (!body.projectIds || body.projectIds.length === 0) {
      return NextResponse.json(
        { error: 'projectIds must be non-empty' },
        { status: 400 },
      );
    }

    if (!body.authors?.usernames || body.authors.usernames.length === 0) {
      return NextResponse.json(
        { error: 'authors.usernames must be non-empty' },
        { status: 400 },
      );
    }

    if (!body.dateRange?.from || !body.dateRange?.to) {
      return NextResponse.json(
        { error: 'dateRange.from and dateRange.to are required' },
        { status: 400 },
      );
    }

    const excludeDrafts = body.filters?.excludeDrafts !== false;

    const projectIds = body.projectIds;

    const allMRs: GitLabMergeRequest[] = [];

    for (const projectId of projectIds) {
      for (const username of body.authors.usernames) {
        const mrs = await getMergedMRs(projectId, username, body.dateRange, token);

        for (const mr of mrs) {
          if (!mr.merged_at) continue;

          const mergedDate = new Date(mr.merged_at);
          const fromDate = new Date(body.dateRange.from);
          const toDate = new Date(body.dateRange.to);

          if (mergedDate < fromDate || mergedDate > toDate) {
            continue;
          }

          if (excludeDrafts && isDraft(mr.title)) {
            continue;
          }

          allMRs.push(mr);
        }
      }
    }

    const dedupeKey = (mr: GitLabMergeRequest) => `${mr.project_id}:${mr.iid}`;
    const seen = new Set<string>();
    const uniqueMRs = allMRs.filter((mr) => {
      const key = dedupeKey(mr);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    uniqueMRs.sort((a, b) => {
      const dateA = new Date(a.merged_at ?? a.updated_at).getTime();
      const dateB = new Date(b.merged_at ?? b.updated_at).getTime();
      return dateB - dateA;
    });

    const mrsToProcess = uniqueMRs.slice(0, REPORT_MAX_MRS);

    const mrDetails: ReportResponse['mergeRequests'] = [];

    await promisePool(mrsToProcess, 5, async (mr) => {
      const detail = await fetchMRWithMetrics(mr, token);
      mrDetails.push(detail);
    });

    const scores = mrDetails.map((mr) => mr.score);
    const linesChanged = mrDetails.map((mr) => mr.metrics.linesChanged);
    const daysOpen = mrDetails.map((mr) => mr.daysOpen);

    const totals = {
      mergedMrCount: mrDetails.length,
      totalLinesChanged: linesChanged.reduce((sum, n) => sum + n, 0),
      avgScore: average(scores),
      medianScore: median(scores),
      avgDaysOpen: average(daysOpen),
    };

    const byAuthorMap = groupByAuthor(mrDetails);
    const byAuthor: ReportResponse['byAuthor'] = [];

    for (const [username, mrs] of byAuthorMap.entries()) {
      const authorMRs = mrs;
      const authorScores = authorMRs.map((mr) => mr.score);
      const authorLines = authorMRs.map((mr) => mr.metrics.linesChanged);
      const authorDaysOpen = authorMRs.map((mr) => mr.daysOpen);

      const largestMr = authorMRs.reduce(
        (max, mr) => (mr.score > (max?.score ?? -1) ? mr : max),
        null as { title: string; webUrl: string; score: number } | null,
      );

      const authorName = authorMRs[0]?.author.name ?? username;

      byAuthor.push({
        username,
        name: authorName,
        mergedMrCount: authorMRs.length,
        totalLinesChanged: authorLines.reduce((sum, n) => sum + n, 0),
        avgScore: average(authorScores),
        medianScore: median(authorScores),
        avgDaysOpen: average(authorDaysOpen),
        largestMr: largestMr
          ? { title: largestMr.title, webUrl: largestMr.webUrl, score: largestMr.score }
          : null,
      });
    }

    byAuthor.sort((a, b) => b.mergedMrCount - a.mergedMrCount);

    const response: ReportResponse = {
      generatedAt: new Date().toISOString(),
      projectIds: body.projectIds,
      dateRange: body.dateRange,
      authors: body.authors.usernames,
      totals,
      byAuthor,
      mergeRequests: mrDetails.sort((a, b) => b.score - a.score),
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
