"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Leaf, ShieldCheck } from "lucide-react";

export function AuthHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "grey.100",
        boxShadow: "0 1px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Leaf aria-hidden size={30} color="#16a34a" strokeWidth={2.5} />
          <Typography
            component="span"
            sx={{ color: "text.primary", fontSize: 22, fontWeight: 700 }}
          >
            NutriConnect
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "primary.dark",
          }}
        >
          <ShieldCheck aria-hidden size={22} strokeWidth={2.4} />
          <Typography
            component="span"
            sx={{ display: { xs: "none", sm: "inline" }, fontWeight: 700 }}
          >
            Secure Portal
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
