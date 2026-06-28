"use client";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" usa vermelho no botão de confirmação; "warning" usa amarelo */
  variant?: "danger" | "warning" | "neutral";
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel  = "Cancelar",
  variant      = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const confirmColor: Record<string, string> = {
    danger:  "#ef4444",
    warning: "#f59e0b",
    neutral: "#6b7280",
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : () => onCancel()}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <AlertTriangle
          size={22}
          color={confirmColor[variant]}
          style={{ flexShrink: 0, marginTop: 2 }}
        />
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0.5, pb: 1 }}>
        <Typography sx={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          color="inherit"
          sx={{ borderRadius: 1, color: "#6b7280" }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            borderRadius:    1,
            boxShadow:       "none",
            bgcolor:         confirmColor[variant],
            "&:hover":       { bgcolor: confirmColor[variant], filter: "brightness(0.9)" },
            "&:disabled":    { bgcolor: "#e5e7eb" },
          }}
        >
          {loading ? "Aguarde..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
