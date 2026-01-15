'use client';

import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

type UserOption = {
  id: number;
  username: string;
  name: string;
};

type SearchFormProps = {
  readonly onSearch: (usernames: string[]) => void;
  readonly isLoading: boolean;
};

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    if (userSearchQuery.trim().length < 2) {
      setUserOptions([]);
      setUsersLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const response = await fetch(`/api/users?search=${encodeURIComponent(userSearchQuery.trim())}`);
        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          const errorMessage = errorData.error ?? `Failed to search users: ${response.status} ${response.statusText}`;
          setUsersError(errorMessage);
          setUserOptions([]);
          return;
        }
        const data = (await response.json()) as { users: UserOption[] };
        setUserOptions(data.users);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
        setUsersError(errorMessage);
        setUserOptions([]);
      } finally {
        setUsersLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userSearchQuery]);

  const handleUserChange = (_event: unknown, newValue: UserOption[]) => {
    setSelectedUsers(newValue);
    if (newValue.length > 0) {
      onSearch(newValue.map((u) => u.username));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        {usersError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" component="div">
              <strong>Error loading users:</strong> {usersError}
            </Typography>
            {usersError.includes('No token found') && (
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
          options={userOptions}
          getOptionLabel={(option) => `${option.name} (@${option.username})`}
          value={selectedUsers}
          onChange={handleUserChange}
          onInputChange={(_, newInputValue) => setUserSearchQuery(newInputValue)}
          loading={usersLoading}
          inputValue={userSearchQuery}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by Authors"
              placeholder="Type to search users (minimum 2 characters)"
              helperText="Select one or more users to search for their merge requests"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box>
                <Box component="div" sx={{ fontWeight: 'medium' }}>
                  {option.name}
                </Box>
                <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  @{option.username}
                </Box>
              </Box>
            </Box>
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(x) => x}
          fullWidth
          disabled={isLoading}
        />
      </Stack>
    </Paper>
  );
}
