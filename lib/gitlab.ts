import type {
  GitLabMRChangesResponse,
  GitLabMergeRequest,
  GitLabProject,
  GitLabUser,
} from '@/types/gitlab';

const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL ?? 'https://gitlab.com/api/v4';

async function gitlabFetch<T>(
  path: string,
  token: string,
  query?: Record<string, string>,
): Promise<{ data: T; headers: Headers }> {
  // Ensure base URL ends with / and path doesn't start with /
  const baseUrl = GITLAB_BASE_URL.endsWith('/') ? GITLAB_BASE_URL : `${GITLAB_BASE_URL}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, baseUrl);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'PRIVATE-TOKEN': token,
      Accept: 'application/json',
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

  // GitLab REST API returns JSON responses, but content-type may include charset
  // or be missing in some cases. We'll try to parse as JSON regardless.
  const contentType = response.headers.get('content-type') ?? '';
  const isLikelyJson =
    contentType.includes('application/json') ||
    contentType === '' ||
    contentType.startsWith('text/');

  let data: T;
  try {
    const text = await response.text();

    if (text.trim().length === 0) {
      throw new Error('GitLab API returned empty response');
    }

    // Check if response is HTML (common when redirected to login or error page)
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      // Extract a snippet for debugging (first 200 chars)
      const snippet = text.substring(0, 200).replace(/\s+/g, ' ');
      throw new Error(
        `GitLab API returned HTML instead of JSON. This usually indicates an authentication issue, incorrect endpoint, or the API base URL is wrong. Response snippet: ${snippet}...`,
      );
    }

    // Try to parse as JSON - GitLab API should always return JSON per documentation
    try {
      data = JSON.parse(text) as T;
    } catch (jsonError) {
      // If content-type explicitly indicates non-JSON, provide better error
      if (
        !isLikelyJson &&
        contentType &&
        !contentType.includes('application/json')
      ) {
        throw new Error(
          `GitLab API returned non-JSON response: ${response.status} ${response.statusText}. Content-Type: ${contentType}`,
        );
      }
      // Otherwise, it's a JSON parsing error - show first part of response for debugging
      const snippet = text.substring(0, 200).replace(/\s+/g, ' ');
      throw new Error(
        `GitLab API returned invalid JSON response. Response snippet: ${snippet}...`,
      );
    }
  } catch (parseError) {
    if (parseError instanceof Error) {
      throw parseError;
    }
    throw new Error('Failed to parse GitLab API response');
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

export async function getMyProjects(
  token: string,
  search?: string,
): Promise<GitLabProject[]> {
  const query: Record<string, string> = {
    membership: 'true',
    simple: 'true',
    order_by: 'name',
    sort: 'asc',
    per_page: '20',
    page: '1',
  };

  if (search && search.trim().length > 0) {
    query.search = search.trim();
  }

  const { data } = await gitlabFetch<GitLabProject[]>('/projects', token, query);
  return data;
}

export async function searchUsers(
  query: string,
  token: string,
): Promise<GitLabUser[]> {
  const { data } = await gitlabFetch<GitLabUser[]>('/users', token, {
    search: query,
    per_page: '20',
    page: '1',
  });
  return data;
}
