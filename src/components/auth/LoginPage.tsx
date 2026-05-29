"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { AccountAccessAlert } from "./AccountAccessAlert";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0fdf4" }}>
      <AuthHeader />
      <Container
        maxWidth="sm"
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          pt: 11,
          pb: 4,
        }}
      >
        <LoginForm />
        <AccountAccessAlert />
      </Container>
    </Box>
  );
}
