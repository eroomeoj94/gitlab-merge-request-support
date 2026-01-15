import Chip from '@mui/material/Chip';
import type { ReportResponse } from '@/types/report';

type SizeBand = ReportResponse['mergeRequests'][0]['sizeBand'];

type SizeBandChipProps = {
  readonly sizeBand: SizeBand;
};

const getBandColor = (band: SizeBand): 'success' | 'warning' | 'error' | 'default' => {
  switch (band) {
    case 'S':
      return 'success';
    case 'M':
      return 'warning';
    case 'L':
      return 'error';
    case 'XL':
      return 'error';
    default:
      return 'default';
  }
};

export default function SizeBandChip({ sizeBand }: SizeBandChipProps) {
  return (
    <Chip
      label={sizeBand}
      color={getBandColor(sizeBand)}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
}
