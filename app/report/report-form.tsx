'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ReportRequest } from '@/types/report';

type ReportFormProps = {
  readonly onSubmit: (request: ReportRequest) => Promise<void>;
  readonly isLoading: boolean;
};

export default function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const [scopeType, setScopeType] = useState<'project' | 'group'>('project');
  const [scopeId, setScopeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [authors, setAuthors] = useState('');
  const [excludeDrafts, setExcludeDrafts] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usernames = authors
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (usernames.length === 0) {
      return;
    }

    const parsedScopeId = parseInt(scopeId, 10);
    if (!scopeId || isNaN(parsedScopeId)) {
      return;
    }

    if (!dateFrom || !dateTo) {
      return;
    }

    const request: ReportRequest = {
      scope: {
        type: scopeType,
        id: parsedScopeId,
      },
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
      authors: {
        usernames,
      },
      filters: {
        excludeDrafts,
      },
    };

    await onSubmit(request);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <FormControl>
            <FormLabel id="scope-type-label">Scope Type</FormLabel>
            <RadioGroup
              row
              aria-labelledby="scope-type-label"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as 'project' | 'group')}
            >
              <FormControlLabel value="project" control={<Radio />} label="Project" />
              <FormControlLabel value="group" control={<Radio />} label="Group" />
            </RadioGroup>
          </FormControl>

          <TextField
            label={scopeType === 'project' ? 'Project ID' : 'Group ID'}
            type="number"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            required
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

          <TextField
            label="Author Usernames (required, comma or newline separated)"
            multiline
            rows={4}
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="username1, username2, username3"
            required
            fullWidth
          />

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
            disabled={isLoading}
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
