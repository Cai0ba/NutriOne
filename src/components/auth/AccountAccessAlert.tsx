"use client";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Info } from "lucide-react";

export function AccountAccessAlert() {
  return (
    <Box sx={{ width: "100%", maxWidth: 460, mt: 2 }}>
      <Alert
        icon={<Info size={22} color="#166534" />}
        severity="success"
        sx={{
          alignItems: "flex-start",
          bgcolor: "#dcfce7",
          color: "#166534",
          border: "1px solid",
          borderColor: "#bbf7d0",
          borderRadius: 1,
          py: 1.5,
          "& .MuiAlert-icon": {
            pt: 0.4,
          },
        }}
      >
        <AlertTitle sx={{ color: "#14532d", fontWeight: 800, mb: 0.25 }}>
          Acesso à Plataforma
        </AlertTitle>
        <Typography component="p" sx={{ color: "#166534", fontSize: 14 }}>
          Apenas usuários cadastrados podem acessar esta plataforma. Entre em
          contato com seu nutricionista caso precise de ajuda para acessar sua conta.
        </Typography>
      </Alert>
    </Box>
  );
}
