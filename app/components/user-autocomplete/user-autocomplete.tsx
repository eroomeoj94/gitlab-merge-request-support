'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import type { UserOption } from '@/types/gitlab';
import { useUserSearch } from './use-user-search';

type UserAutocompleteProps = {
  readonly value: UserOption[];
  readonly onChange: (users: UserOption[]) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly error?: boolean;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly showAvatars?: boolean;
  readonly showErrorAlert?: boolean;
  readonly onInputChange?: (inputValue: string) => void;
};

export function UserAutocomplete({
  value,
  onChange,
  label,
  placeholder = 'Type to search users (minimum 2 characters)',
  helperText,
  error = false,
  errorText,
  disabled = false,
  showAvatars = false,
  showErrorAlert = false,
  onInputChange,
}: UserAutocompleteProps) {
  const { userOptions, userSearchQuery, setUserSearchQuery, isLoading, error: apiError } = useUserSearch();

  const handleInputChange = (_event: unknown, newInputValue: string) => {
    setUserSearchQuery(newInputValue);
    onInputChange?.(newInputValue);
  };

  return (
    <>
      {showErrorAlert && apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" component="div">
            <strong>Error loading users:</strong> {apiError}
          </Typography>
          {apiError.includes('No token found') && (
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
        value={value}
        onChange={(_event, newValue) => onChange(newValue)}
        onInputChange={handleInputChange}
        loading={isLoading}
        inputValue={userSearchQuery}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            helperText={error && errorText ? errorText : helperText}
            error={error}
          />
        )}
        renderTags={
          showAvatars
            ? (tagValue, getTagProps) =>
                tagValue.map((option, index) => (
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
            : undefined
        }
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            {showAvatars ? (
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
            ) : (
              <Box>
                <Box component="div" sx={{ fontWeight: 'medium' }}>
                  {option.name}
                </Box>
                <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  @{option.username}
                </Box>
              </Box>
            )}
          </Box>
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterOptions={(x) => x}
        fullWidth
        disabled={disabled}
      />
    </>
  );
}
