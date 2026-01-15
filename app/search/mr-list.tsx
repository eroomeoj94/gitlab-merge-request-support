'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SearchMergeRequest } from '@/types/search';
import MRRow from './mr-row';

type MRListProps = {
  readonly mergeRequests: SearchMergeRequest[];
  readonly isLoading?: boolean;
};

export default function MRList({ mergeRequests, isLoading }: MRListProps) {
  if (isLoading) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Loading merge requests...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (mergeRequests.length === 0) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No merge requests found
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box>
        {mergeRequests.map((mr) => (
          <MRRow key={`${mr.projectId}-${mr.iid}`} mr={mr} />
        ))}
      </Box>
    </Paper>
  );
}
