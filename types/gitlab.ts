export type GitLabUser = {
  readonly id: number;
  readonly username: string;
  readonly name: string;
  readonly email: string;
  readonly avatar_url?: string;
};

export type GitLabProject = {
  readonly id: number;
  readonly name: string;
  readonly path_with_namespace: string;
};

export type GitLabMergeRequest = {
  readonly id: number;
  readonly iid: number;
  readonly project_id: number;
  readonly title: string;
  readonly web_url: string;
  readonly author: {
    readonly id: number;
    readonly username: string;
    readonly name: string;
    readonly avatar_url?: string;
  };
  readonly created_at: string;
  readonly merged_at: string | null;
  readonly updated_at: string;
  readonly state: string;
  readonly additions?: number;
  readonly deletions?: number;
  readonly user_notes_count?: number;
  readonly upvotes?: number;
  readonly downvotes?: number;
  readonly references?: {
    readonly short?: string;
    readonly relative?: string;
    readonly full?: string;
  };
};

export type GitLabMRChange = {
  readonly old_path: string;
  readonly new_path: string;
  readonly new_file: boolean;
  readonly renamed_file: boolean;
  readonly deleted_file: boolean;
  readonly diff?: string;
};

export type GitLabMRChangesResponse = {
  readonly changes: readonly GitLabMRChange[];
};

export type GitLabCommit = {
  readonly id: string;
  readonly short_id: string;
  readonly title: string;
  readonly message: string;
  readonly author_name: string;
  readonly author_email: string;
  readonly authored_date: string;
  readonly committer_name: string;
  readonly committer_email: string;
  readonly committed_date: string;
  readonly created_at: string;
};
