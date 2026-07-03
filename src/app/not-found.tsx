"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Home, Leaf, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0fdf4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 6 }}>
        <Leaf size={28} color="#10b981" strokeWidth={2.6} aria-hidden />
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
          NutriOne
        </Typography>
      </Box>

      {/* Número */}
      <Typography
        sx={{
          fontSize: { xs: 96, md: 140 },
          fontWeight: 900,
          color: "#10b981",
          lineHeight: 1,
          mb: 1,
          opacity: 0.15,
          userSelect: "none",
        }}
      >
        404
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: 24, md: 32 },
          fontWeight: 900,
          color: "#111827",
          mb: 1.5,
          mt: -4,
        }}
      >
        Página não encontrada
      </Typography>

      <Typography
        sx={{
          fontSize: 16,
          color: "#6b7280",
          maxWidth: 400,
          lineHeight: 1.65,
          mb: 5,
        }}
      >
        O endereço que você acessou não existe ou foi removido. Verifique o link ou volte para o início.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          startIcon={<Home size={18} />}
          sx={{
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            borderRadius: 1.5,
            fontWeight: 700,
            px: 3,
            py: 1.4,
          }}
        >
          Ir para o login
        </Button>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          startIcon={<MoveLeft size={18} />}
          sx={{
            borderColor: "#d1d5db",
            color: "#374151",
            borderRadius: 1.5,
            fontWeight: 700,
            px: 3,
            py: 1.4,
            "&:hover": { borderColor: "#9ca3af", bgcolor: "transparent" },
          }}
        >
          Página inicial
        </Button>
      </Box>
    </Box>
  );
}
