"use client";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { EyeOff } from "lucide-react";

/** Aviso exibido no lugar de medidas e gráficos quando o "modo sem números" está ligado. */
export function NumbersHiddenNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: compact ? 3 : 5, textAlign: "center", mb: compact ? 3 : 0 }}
    >
      <EyeOff size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
      <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>
        Modo sem números ativado
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.5 }}>
        Seu nutricionista continua acompanhando suas medidas. Você pode mudar isso em Preferências.
      </Typography>
    </Paper>
  );
}
