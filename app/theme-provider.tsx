'use client';

import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, theme } from '@/lib/theme';

type ThemeProviderWrapperProps = {
  readonly children: React.ReactNode;
  readonly prefersDarkMode: boolean;
};

export default function ThemeProviderWrapper({
  children,
  prefersDarkMode,
}: ThemeProviderWrapperProps) {
  const currentTheme = useMemo(
    () => (prefersDarkMode ? darkTheme : theme),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
