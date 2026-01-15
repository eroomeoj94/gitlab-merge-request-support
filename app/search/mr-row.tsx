'use client';

import { useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SearchMergeRequest } from '@/types/search';

type MRRowProps = {
  readonly mr: SearchMergeRequest;
};

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}

function getStateColor(state: SearchMergeRequest['state']): string {
  switch (state) {
    case 'opened':
      return '#1aaa55';
    case 'merged':
      return '#9337e8';
    case 'closed':
      return '#e24329';
    default:
      return '#999';
  }
}

function getStateLabel(state: SearchMergeRequest['state'], updatedAt: string): string {
  const timeAgo = formatRelativeTime(updatedAt);
  switch (state) {
    case 'opened':
      return `opened ${timeAgo}`;
    case 'merged':
      return `merged ${timeAgo}`;
    case 'closed':
      return `closed ${timeAgo}`;
    default:
      return timeAgo;
  }
}

export default function MRRow({ mr }: MRRowProps) {
  const stateColor = useMemo(() => getStateColor(mr.state), [mr.state]);
  const stateLabel = useMemo(() => getStateLabel(mr.state, mr.updatedAt), [mr.state, mr.updatedAt]);
  const mrReference = `!${mr.iid}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        borderLeft: `3px solid ${stateColor}`,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        transition: 'background-color 0.2s',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
          <Link
            href={mr.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              flex: 1,
              minWidth: 0,
            }}
          >
            {mr.title}
          </Link>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              fontSize: '0.8125rem',
            }}
          >
            {mr.projectPath && `${mr.projectPath} `}
            {mrReference}
          </Typography>

          <Box
            component="span"
            sx={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'text.secondary',
              display: 'inline-block',
            }}
          />

          <Stack direction="row" spacing={0.5} alignItems="center">
            {mr.author.avatarUrl ? (
              <Avatar
                src={mr.author.avatarUrl}
                alt={mr.author.name}
                sx={{ width: 16, height: 16 }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 16,
                  height: 16,
                  fontSize: '0.625rem',
                  bgcolor: 'primary.main',
                }}
              >
                {mr.author.name.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              {mr.author.name}
            </Typography>
          </Stack>

          <Box
            component="span"
            sx={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'text.secondary',
              display: 'inline-block',
            }}
          />

          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
            {stateLabel}
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
        {mr.userNotesCount > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              💬 {mr.userNotesCount}
            </Typography>
          </Stack>
        )}

        {mr.upvotes > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              👍 {mr.upvotes}
            </Typography>
          </Stack>
        )}

        {mr.downvotes > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              👎 {mr.downvotes}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
