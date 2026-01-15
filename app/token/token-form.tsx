'use client';

import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SaveTokenResponse } from '@/types/report';

type TokenFormProps = {
  readonly onSave: (token: string) => Promise<void>;
  readonly onDelete: () => Promise<void>;
  readonly isLoading: boolean;
  readonly result: SaveTokenResponse | null;
  readonly error: string | null;
};

export default function TokenForm({
  onSave,
  onDelete,
  isLoading,
  result,
  error,
}: TokenFormProps) {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (result?.ok) {
      setToken('');
    }
  }, [result]);

  const handleSave = async () => {
    if (!token.trim()) {
      return;
    }

    await onSave(token);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <TextField
          label="Personal Access Token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your GitLab Personal Access Token"
          disabled={isLoading}
          fullWidth
          helperText="Your token is stored securely server-side and never sent back to the client."
        />

        <Stack direction="row" spacing={2}>
          <Button
            onClick={handleSave}
            disabled={isLoading || !token.trim()}
            variant="contained"
            aria-label={isLoading ? 'Saving token, please wait' : 'Save token'}
          >
            {isLoading ? 'Saving...' : 'Save Token'}
          </Button>
          <Button
            onClick={onDelete}
            disabled={isLoading}
            variant="outlined"
            aria-label={isLoading ? 'Deleting token, please wait' : 'Delete token'}
          >
            {isLoading ? 'Deleting...' : 'Delete Token'}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {result?.ok && (
          <Alert severity="success">
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Token saved successfully!
            </Typography>
            {'user' in result && (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  User: {result.user.name} (@{result.user.username})
                </Typography>
                <Typography variant="body2">
                  Expires: {new Date(result.expiresAt).toLocaleString()}
                </Typography>
              </Stack>
            )}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
