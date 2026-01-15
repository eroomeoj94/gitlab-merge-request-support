import type {
  GitLabUser,
  GitLabProject,
  GitLabMergeRequest,
  GitLabMRChangesResponse,
} from '@/types/gitlab';

const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL ?? 'https://gitlab.com/api/v4';

async function gitlabFetch<T>(
  path: string,
  token: string,
  query?: Record<string, string>,
): Promise<{ data: T; headers: Headers }> {
  const url = new URL(path, GITLAB_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'PRIVATE-TOKEN': token,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitLab token');
    }
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    if (response.status === 403) {
      throw new Error('Access forbidden');
    }
    throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      `GitLab API returned non-JSON response: ${response.status} ${response.statusText}`,
    );
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      throw new Error('GitLab API returned invalid JSON response');
    }
    throw parseError;
  }

  return { data, headers: response.headers };
}

export async function paginate<T>(
  path: string,
  token: string,
  query?: Record<string, string>,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const queryWithPage = {
      ...query,
      page: page.toString(),
      per_page: perPage.toString(),
    };

    const { data, headers } = await gitlabFetch<T[]>(path, token, queryWithPage);
    results.push(...data);

    const nextPage = headers.get('x-next-page');
    if (!nextPage || nextPage === '') {
      break;
    }

    page = parseInt(nextPage, 10);
    if (isNaN(page) || page <= 0) {
      break;
    }
  }

  return results;
}

export async function validateToken(token: string): Promise<GitLabUser> {
  const { data } = await gitlabFetch<GitLabUser>('/user', token);
  return data;
}

export async function getGroupProjects(
  groupId: number,
  token: string,
): Promise<GitLabProject[]> {
  return paginate<GitLabProject>(`/groups/${groupId}/projects`, token, {
    include_subgroups: 'true',
  });
}

export async function getMergedMRs(
  projectId: number,
  authorUsername: string,
  dateRange: { from: string; to: string },
  token: string,
): Promise<GitLabMergeRequest[]> {
  const query: Record<string, string> = {
    state: 'merged',
    author_username: authorUsername,
    updated_after: dateRange.from,
    updated_before: dateRange.to,
  };

  const mrs = await paginate<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests`,
    token,
    query,
  );

  return mrs;
}

export async function getMRChanges(
  projectId: number,
  iid: number,
  token: string,
): Promise<GitLabMRChangesResponse> {
  const { data } = await gitlabFetch<GitLabMRChangesResponse>(
    `/projects/${projectId}/merge_requests/${iid}/changes`,
    token,
  );
  return data;
}

export async function getMRDetails(
  projectId: number,
  iid: number,
  token: string,
): Promise<GitLabMergeRequest> {
  const { data } = await gitlabFetch<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests/${iid}`,
    token,
  );
  return data;
}
