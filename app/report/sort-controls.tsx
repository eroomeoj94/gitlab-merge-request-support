import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

export type SortField = 'score' | 'mergedAt' | 'title' | 'daysOpen';
export type SortDirection = 'asc' | 'desc';

type SortControlsProps = {
  readonly sortField: SortField;
  readonly sortDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
};

export default function SortControls({
  sortField,
  sortDirection,
  onSort,
}: SortControlsProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => onSort('score')}
          variant={sortField === 'score' ? 'contained' : 'outlined'}
          aria-label={`Sort by score ${sortField === 'score' ? `(${sortDirection})` : ''}`}
        >
          Sort by Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          onClick={() => onSort('mergedAt')}
          variant={sortField === 'mergedAt' ? 'contained' : 'outlined'}
          aria-label={`Sort by date ${sortField === 'mergedAt' ? `(${sortDirection})` : ''}`}
        >
          Sort by Date{' '}
          {sortField === 'mergedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          onClick={() => onSort('title')}
          variant={sortField === 'title' ? 'contained' : 'outlined'}
          aria-label={`Sort by title ${sortField === 'title' ? `(${sortDirection})` : ''}`}
        >
          Sort by Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          onClick={() => onSort('daysOpen')}
          variant={sortField === 'daysOpen' ? 'contained' : 'outlined'}
          aria-label={`Sort by days open ${sortField === 'daysOpen' ? `(${sortDirection})` : ''}`}
        >
          Sort by Days Open{' '}
          {sortField === 'daysOpen' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Button>
      </ButtonGroup>
    </Box>
  );
}
