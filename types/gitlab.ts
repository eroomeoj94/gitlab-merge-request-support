export type GitLabUser = {
  readonly id: number;
  readonly username: string;
  readonly name: string;
  readonly email: string;
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
  };
  readonly created_at: string;
  readonly merged_at: string | null;
  readonly updated_at: string;
  readonly state: string;
  readonly additions?: number;
  readonly deletions?: number;
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
