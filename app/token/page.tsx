'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { SaveTokenResponse } from '@/types/report';
import BackLink from '../components/back-link';
import TokenForm from './token-form';

export default function TokenPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SaveTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (token: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = (await response.json()) as SaveTokenResponse;
          setError(errorData.ok === false ? errorData.error : `Error: ${response.status}`);
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = (await response.json()) as SaveTokenResponse;

      if (data.ok) {
        setResult(data);
      } else {
        setError(data.error);
        setResult(data);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid response from server. Please check the API route is working.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await fetch('/api/token', {
        method: 'DELETE',
      });

      setResult({ ok: true, expiresAt: '', user: { username: '', name: '' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <BackLink href="/">Back to Home</BackLink>

      <Typography variant="h4" component="h1" gutterBottom>
        Manage GitLab Token
      </Typography>

      <TokenForm
        onSave={handleSave}
        onDelete={handleDelete}
        isLoading={loading}
        result={result}
        error={error}
      />
    </Container>
  );
}
