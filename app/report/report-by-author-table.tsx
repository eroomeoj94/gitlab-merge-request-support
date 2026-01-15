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
import { formatDuration } from '@/lib/format-duration';

type ReportByAuthorTableProps = {
  readonly byAuthor: ReportResponse['byAuthor'];
};

export default function ReportByAuthorTable({ byAuthor }: ReportByAuthorTableProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        By Author
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell align="right">MRs</TableCell>
              <TableCell align="right">Lines Changed</TableCell>
              <TableCell align="right">Avg Score</TableCell>
              <TableCell align="right">Median Score</TableCell>
              <TableCell align="right">Avg Days Open</TableCell>
              <TableCell>Largest MR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {byAuthor.map((author) => (
              <TableRow key={author.username}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{author.username}
                  </Typography>
                </TableCell>
                <TableCell align="right">{author.mergedMrCount}</TableCell>
                <TableCell align="right">
                  {author.totalLinesChanged.toLocaleString()}
                </TableCell>
                <TableCell align="right">{Math.round(author.avgScore)}</TableCell>
                <TableCell align="right">{Math.round(author.medianScore)}</TableCell>
                <TableCell align="right">
                  {formatDuration(author.avgDaysOpen)}
                </TableCell>
                <TableCell>
                  {author.largestMr ? (
                    <Link
                      href={author.largestMr.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      {author.largestMr.title} (Score: {author.largestMr.score})
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
