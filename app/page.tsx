import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h3" component="h1" gutterBottom>
            GitLab MR Size Scoring
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            Analyze merge request sizes and generate reports for specific authors within
            GitLab projects or groups.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Link href="/token" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" sx={{ minWidth: 158 }} fullWidth>
              Manage Token
            </Button>
          </Link>
          <Link href="/report" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" size="large" sx={{ minWidth: 158 }} fullWidth>
              Generate Report
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
}
