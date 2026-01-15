'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { MRState } from '@/types/search';

type MRTabsProps = {
  readonly currentState: MRState;
  readonly onStateChange: (state: MRState) => void;
  readonly counts?: {
    readonly opened?: number;
    readonly merged?: number;
    readonly closed?: number;
  };
};

export default function MRTabs({ currentState, onStateChange, counts }: MRTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const states: MRState[] = ['opened', 'merged', 'closed'];
    onStateChange(states[newValue] ?? 'opened');
  };

  const tabIndex = currentState === 'opened' ? 0 : currentState === 'merged' ? 1 : 2;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={tabIndex} onChange={handleChange} aria-label="merge request state tabs">
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Open</span>
              {counts?.opened !== undefined && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'action.selected',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {counts.opened}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Merged</span>
              {counts?.merged !== undefined && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'action.selected',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {counts.merged}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Closed</span>
              {counts?.closed !== undefined && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'action.selected',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {counts.closed}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
    </Box>
  );
}
