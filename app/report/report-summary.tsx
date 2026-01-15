import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReportResponse } from '@/types/report';

type ReportSummaryProps = {
  readonly totals: ReportResponse['totals'];
};

export default function ReportSummary({ totals }: ReportSummaryProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Summary
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total MRs
          </Typography>
          <Typography variant="h4" component="div">
            {totals.mergedMrCount}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Lines Changed
          </Typography>
          <Typography variant="h4" component="div">
            {totals.totalLinesChanged.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Avg Score
          </Typography>
          <Typography variant="h4" component="div">
            {Math.round(totals.avgScore)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Median Score
          </Typography>
          <Typography variant="h4" component="div">
            {Math.round(totals.medianScore)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
