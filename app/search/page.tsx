'use client';

import { useState, useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SearchMergeRequest, MRState } from '@/types/search';
import BackLink from '../components/back-link';
import ErrorAlert from '../components/error-alert';
import SearchForm from './search-form';
import MRTabs from './mr-tabs';
import MRList from './mr-list';

type MRsByState = {
  opened: SearchMergeRequest[];
  merged: SearchMergeRequest[];
  closed: SearchMergeRequest[];
};

export default function SearchPage() {
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [currentState, setCurrentState] = useState<MRState>('opened');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mrsByState, setMrsByState] = useState<MRsByState>({
    opened: [],
    merged: [],
    closed: [],
  });

  const currentMRs = useMemo(() => {
    return mrsByState[currentState] ?? [];
  }, [mrsByState, currentState]);

  const counts = useMemo(() => {
    return {
      opened: mrsByState.opened.length,
      merged: mrsByState.merged.length,
      closed: mrsByState.closed.length,
    };
  }, [mrsByState]);

  useEffect(() => {
    if (selectedUsernames.length === 0) {
      setMrsByState({ opened: [], merged: [], closed: [] });
      setError(null);
      return;
    }

    const fetchMRs = async (state: MRState) => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorUsernames: selectedUsernames,
            state,
            perPage: 100,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error: string };
          throw new Error(errorData.error || 'Failed to fetch merge requests');
        }

        const data = (await response.json()) as { mergeRequests: SearchMergeRequest[]; state: MRState };
        return data.mergeRequests;
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Failed to fetch merge requests');
      }
    };

    const loadAllStates = async () => {
      setLoading(true);
      setError(null);

      try {
        const [opened, merged, closed] = await Promise.all([
          fetchMRs('opened'),
          fetchMRs('merged'),
          fetchMRs('closed'),
        ]);

        setMrsByState({
          opened,
          merged,
          closed,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merge requests');
        setMrsByState({ opened: [], merged: [], closed: [] });
      } finally {
        setLoading(false);
      }
    };

    loadAllStates();
  }, [selectedUsernames]);

  const handleSearch = (usernames: string[]) => {
    setSelectedUsernames(usernames);
  };

  const handleStateChange = (state: MRState) => {
    setCurrentState(state);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <BackLink href="/">Back to Home</BackLink>

      <Typography variant="h4" component="h1" gutterBottom>
        Search Merge Requests
      </Typography>

      <Stack spacing={3}>
        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {error && <ErrorAlert message={error} />}

        {selectedUsernames.length > 0 && (
          <>
            <MRTabs currentState={currentState} onStateChange={handleStateChange} counts={counts} />
            <MRList mergeRequests={currentMRs} isLoading={loading} />
          </>
        )}

        {selectedUsernames.length === 0 && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Select one or more users above to search for their merge requests
          </Typography>
        )}
      </Stack>
    </Container>
  );
}
