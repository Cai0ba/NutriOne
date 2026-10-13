"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { toast } from "sonner";
import { usePatientPreferences } from "@/lib/usePatientPreferences";

type PreferencesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function PreferencesDialog({ open, onClose }: PreferencesDialogProps) {
  const { modoSemNumeros, loading, save } = usePatientPreferences();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    try {
      await save(value);
      toast.success(value ? "Modo sem números ativado." : "Modo sem números desativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Preferências</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#111827" }}>Modo sem números</Typography>
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
              Esconde peso, IMC, gordura e outras medidas no aplicativo. Seu nutricionista continua
              acompanhando tudo normalmente.
            </Typography>
          </Box>
          <Switch
            checked={Boolean(modoSemNumeros)}
            disabled={loading || saving}
            onChange={(e) => handleToggle(e.target.checked)}
            slotProps={{ input: { "aria-label": "Modo sem números" } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "#6b7280" }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
