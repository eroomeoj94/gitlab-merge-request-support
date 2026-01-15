export type GitLabUser = {
  id: number;
  username: string;
  name: string;
  email: string;
};

export type GitLabProject = {
  id: number;
  name: string;
  path_with_namespace: string;
};

export type GitLabMergeRequest = {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  web_url: string;
  author: {
    id: number;
    username: string;
    name: string;
  };
  merged_at: string | null;
  updated_at: string;
  state: string;
  additions?: number;
  deletions?: number;
};

export type GitLabMRChange = {
  old_path: string;
  new_path: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
  diff?: string;
};

export type GitLabMRChangesResponse = {
  changes: GitLabMRChange[];
};
