import Link from 'next/link';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';

type BackLinkProps = {
  readonly href: string;
  readonly children: React.ReactNode;
};

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <MuiLink component="span" color="text.secondary" sx={{ textDecoration: 'none' }}>
          ← {children}
        </MuiLink>
      </Link>
    </Box>
  );
}
