"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0fdf4",
      paper: "#ffffff",
    },
    primary: {
      main: "#10b981",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
});

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
