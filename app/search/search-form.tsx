'use client';

import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import type { UserOption } from '@/app/components/user-autocomplete';
import { UserAutocomplete } from '@/app/components/user-autocomplete';

type SearchFormProps = {
  readonly onSearch: (usernames: string[]) => void;
  readonly isLoading: boolean;
};

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  const handleUserChange = (newValue: UserOption[]) => {
    setSelectedUsers(newValue);
    if (newValue.length > 0) {
      onSearch(newValue.map((u) => u.username));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <UserAutocomplete
          value={selectedUsers}
          onChange={handleUserChange}
          label="Search by Authors"
          placeholder="Type to search users (minimum 2 characters)"
          helperText="Select one or more users to search for their merge requests"
          disabled={isLoading}
          showErrorAlert={true}
        />
      </Stack>
    </Paper>
  );
}
