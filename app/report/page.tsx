'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReportRequest, ReportResponse } from '@/types/report';
import BackLink from '../components/back-link';
import ErrorAlert from '../components/error-alert';
import MergeRequestsTable from './merge-requests-table';
import ReportByAuthorTable from './report-by-author-table';
import ReportForm from './report-form';
import ReportSummary from './report-summary';
import { type SortDirection, type SortField } from './sort-controls';

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSubmit = async (request: ReportRequest) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string };
        setError(errorData.error || 'Failed to generate report');
        return;
      }

      const data = (await response.json()) as ReportResponse;
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <BackLink href="/">Back to Home</BackLink>

      <Typography variant="h4" component="h1" gutterBottom>
        Generate Report
      </Typography>

      <Stack spacing={3}>
        <ReportForm onSubmit={handleSubmit} isLoading={loading} />

        {error && <ErrorAlert message={error} />}

        {report && (
          <>
            <ReportSummary totals={report.totals} />
            <ReportByAuthorTable byAuthor={report.byAuthor} />
            <MergeRequestsTable
              mergeRequests={report.mergeRequests}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </>
        )}
      </Stack>
    </Container>
  );
}
