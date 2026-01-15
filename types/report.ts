export type SaveTokenRequest = {
  token: string;
};

export type SaveTokenResponse =
  | { ok: true; expiresAt: string; user: { username: string; name: string } }
  | { ok: false; error: string };

export type DeleteTokenResponse = { ok: true };

export type ReportRequest = {
  scope: { type: 'project' | 'group'; id: number };
  dateRange: { from: string; to: string };
  authors: { usernames: string[] };
  filters?: { excludeDrafts?: boolean };
};

export type ReportResponse = {
  generatedAt: string;
  scope: { type: 'project' | 'group'; id: number };
  dateRange: { from: string; to: string };
  authors: string[];

  totals: {
    mergedMrCount: number;
    totalLinesChanged: number;
    avgScore: number;
    medianScore: number;
  };

  byAuthor: Array<{
    username: string;
    name: string;
    mergedMrCount: number;
    totalLinesChanged: number;
    avgScore: number;
    medianScore: number;
    largestMr: { title: string; webUrl: string; score: number } | null;
  }>;

  mergeRequests: Array<{
    projectId: number;
    iid: number;
    title: string;
    webUrl: string;
    author: { username: string; name: string };
    mergedAt: string;
    metrics: {
      additions: number;
      deletions: number;
      linesChanged: number;
      filesChanged: number;
      dirsTouched: number;
    };
    score: number;
    sizeBand: 'S' | 'M' | 'L' | 'XL';
  }>;
};

export type MRMetrics = {
  additions: number;
  deletions: number;
  linesChanged: number;
  filesChanged: number;
  dirsTouched: number;
};
