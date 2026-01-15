import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReportResponse } from '@/types/report';
import SizeBandChip from './size-band-chip';
import SortControls, { type SortDirection, type SortField } from './sort-controls';

type MergeRequestsTableProps = {
  readonly mergeRequests: ReportResponse['mergeRequests'];
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
};

export default function MergeRequestsTable({
  mergeRequests,
  sortField,
  sortDirection,
  onSort,
}: MergeRequestsTableProps) {
  const sortedMRs = [...mergeRequests].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'score') {
      comparison = a.score - b.score;
    } else if (sortField === 'mergedAt') {
      comparison = new Date(a.mergedAt).getTime() - new Date(b.mergedAt).getTime();
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Merge Requests
      </Typography>
      <SortControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Lines</TableCell>
              <TableCell align="right">Files</TableCell>
              <TableCell align="right">Dirs</TableCell>
              <TableCell>Merged</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMRs.map((mr) => (
              <TableRow key={`${mr.projectId}-${mr.iid}`}>
                <TableCell>
                  <Link
                    href={mr.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontWeight="medium"
                  >
                    {mr.title}
                  </Link>
                </TableCell>
                <TableCell>{mr.author.username}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                  {mr.score}
                </TableCell>
                <TableCell align="right">
                  <SizeBandChip sizeBand={mr.sizeBand} />
                </TableCell>
                <TableCell align="right">
                  {mr.metrics.linesChanged.toLocaleString()}
                </TableCell>
                <TableCell align="right">{mr.metrics.filesChanged}</TableCell>
                <TableCell align="right">{mr.metrics.dirsTouched}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(mr.mergedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
