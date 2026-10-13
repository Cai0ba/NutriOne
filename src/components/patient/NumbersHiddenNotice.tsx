"use client";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { EyeOff } from "lucide-react";

type NumbersHiddenNoticeProps = {
  compact?: boolean;
  /** As preferências não carregaram: os números ficam escondidos por segurança. */
  error?: boolean;
  onRetry?: () => void;
};

/** Aviso exibido no lugar de medidas e gráficos quando os números estão escondidos. */
export function NumbersHiddenNotice({ compact = false, error = false, onRetry }: NumbersHiddenNoticeProps) {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: compact ? 3 : 5, textAlign: "center", mb: compact ? 3 : 0 }}
    >
      <EyeOff size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
      {error ? (
        <>
          <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>
            Não foi possível carregar suas preferências
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.5 }}>
            Por segurança, as medidas ficam escondidas até conseguirmos confirmar.
          </Typography>
          {onRetry && (
            <Button size="small" onClick={onRetry} sx={{ mt: 1 }}>
              Tentar de novo
            </Button>
          )}
        </>
      ) : (
        <>
          <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>
            Modo sem números ativado
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.5 }}>
            Seu nutricionista continua acompanhando suas medidas. Você pode mudar isso em Preferências.
          </Typography>
        </>
      )}
    </Paper>
  );
}
