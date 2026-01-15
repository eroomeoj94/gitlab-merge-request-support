export type MRState = 'opened' | 'merged' | 'closed';

export type SearchRequest = {
  authorUsernames: string[];
  state: MRState;
  perPage?: number;
};

export type SearchMergeRequest = {
  id: number;
  iid: number;
  projectId: number;
  projectPath: string;
  title: string;
  webUrl: string;
  state: MRState;
  author: { username: string; name: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  userNotesCount: number;
  upvotes: number;
  downvotes: number;
};

export type SearchResponse = {
  mergeRequests: SearchMergeRequest[];
  state: MRState;
};
