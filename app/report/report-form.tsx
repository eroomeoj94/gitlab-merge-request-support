'use client';

import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import type { ReportRequest } from '@/types/report';

type ProjectOption = {
  id: number;
  name: string;
  pathWithNamespace: string;
};

type UserOption = {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
};

type ReportFormProps = {
  readonly onSubmit: (request: ReportRequest) => Promise<void>;
  readonly isLoading: boolean;
};

export default function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<ProjectOption[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split('T')[0] ?? '');
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0] ?? '');
  const [excludeDrafts, setExcludeDrafts] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    if (projectSearchQuery.trim().length < 2) {
      setProjectOptions([]);
      setProjectsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setProjectsLoading(true);
        setProjectsError(null);
        const response = await fetch(`/api/projects?search=${encodeURIComponent(projectSearchQuery.trim())}`);
        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          const errorMessage = errorData.error ?? `Failed to search projects: ${response.status} ${response.statusText}`;
          setProjectsError(errorMessage);
          setProjectOptions([]);
          return;
        }
        const data = (await response.json()) as { projects: ProjectOption[] };
        setProjectOptions(data.projects);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search projects';
        setProjectsError(errorMessage);
        setProjectOptions([]);
        console.error('Error searching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [projectSearchQuery]);

  useEffect(() => {
    if (userSearchQuery.trim().length < 2) {
      setUserOptions([]);
      setUsersLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setUsersLoading(true);
        const response = await fetch(`/api/users?search=${encodeURIComponent(userSearchQuery.trim())}`);
        if (!response.ok) {
          throw new Error('Failed to search users');
        }
        const data = (await response.json()) as { users: UserOption[] };
        setUserOptions(data.users);
      } catch (error) {
        console.error('Error searching users:', error);
        setUserOptions([]);
      } finally {
        setUsersLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userSearchQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      return;
    }

    if (!dateFrom || !dateTo) {
      return;
    }

    const request: ReportRequest = {
      ...(selectedProjects.length > 0 && { projectIds: selectedProjects.map((p) => p.id) }),
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
      authors: {
        usernames: selectedUsers.map((u) => u.username),
      },
      filters: {
        excludeDrafts,
      },
    };

    await onSubmit(request);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {projectsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" component="div">
                <strong>Error loading projects:</strong> {projectsError}
              </Typography>
              {projectsError.includes('No token found') && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  Please save your GitLab token on the{' '}
                  <a href="/token" style={{ textDecoration: 'underline' }}>
                    token page
                  </a>{' '}
                  first.
                </Typography>
              )}
            </Alert>
          )}
          <Autocomplete
            multiple
            options={projectOptions}
            getOptionLabel={(option) => option.name}
            value={selectedProjects}
            onChange={(_, newValue) => setSelectedProjects(newValue)}
            onInputChange={(_, newInputValue) => setProjectSearchQuery(newInputValue)}
            loading={projectsLoading}
            inputValue={projectSearchQuery}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projects (optional)"
                placeholder="Type to search projects (minimum 2 characters). Leave empty to search all projects."
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <Box component="div" sx={{ fontWeight: 'medium' }}>
                    {option.name}
                  </Box>
                  <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {option.pathWithNamespace}
                  </Box>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />

          <Autocomplete
            multiple
            options={userOptions}
            getOptionLabel={(option) => `${option.name} (@${option.username})`}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            onInputChange={(_, newInputValue) => setUserSearchQuery(newInputValue)}
            loading={usersLoading}
            inputValue={userSearchQuery}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Users (required, select at least one)"
                placeholder="Type to search users (minimum 2 characters)"
                error={selectedUsers.length === 0 && userSearchQuery.length > 0}
                helperText={
                  selectedUsers.length === 0 && userSearchQuery.length > 0
                    ? 'Please select at least one user'
                    : ''
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.name}
                  avatar={
                    option.avatarUrl ? (
                      <Avatar src={option.avatarUrl} alt={option.name} sx={{ width: 24, height: 24 }} />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )
                  }
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                  {option.avatarUrl ? (
                    <Avatar src={option.avatarUrl} alt={option.name} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
                      {option.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Box component="div" sx={{ fontWeight: 'medium' }}>
                      {option.name}
                    </Box>
                    <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      @{option.username}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(x) => x}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={excludeDrafts}
                onChange={(e) => setExcludeDrafts(e.target.checked)}
              />
            }
            label='Exclude drafts (titles starting with "Draft:" or "WIP:")'
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || selectedUsers.length === 0}
            fullWidth
            aria-label={isLoading ? 'Generating report, please wait' : 'Generate report'}
          >
            {isLoading ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
