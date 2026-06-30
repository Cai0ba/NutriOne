"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Calendar, Clock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  cancelAppointmentNutritionist,
  cancelSelfAppointment,
  type Appointment,
} from "@/lib/appointments";
import { getStoredToken } from "@/lib/auth";
import { STATUS_CFG, TIPO_CFG } from "./MonthCalendar";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:        boolean;
  appointment: Appointment | null;
  role:        "nutritionist" | "patient";
  onClose:     () => void;
  onEdit?:     (appt: Appointment) => void;
  onCancelled: (appt: Appointment) => void;
};

// ─── Linha de detalhe ─────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
      <Box sx={{ color: "#9ca3af", flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AppointmentDetailModal({ open, appointment, role, onClose, onEdit, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [motivo, setMotivo] = useState("");

  if (!appointment) return null;

  const statusCfg = STATUS_CFG[appointment.status];
  const tipoCfg   = TIPO_CFG[appointment.tipo];
  const dataHora  = new Date(appointment.dataHora);
  const canCancel = appointment.status === "agendado";

  const patientName = typeof appointment.patientId === "object"
    ? appointment.patientId.nome
    : "";

  const fmtDate = dataHora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtTime = dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleCancel = async () => {
    const token = getStoredToken();
    if (!token) return;
    setCancelling(true);
    try {
      const updated = role === "nutritionist"
        ? await cancelAppointmentNutritionist(token, appointment._id, motivo || undefined)
        : await cancelSelfAppointment(token, appointment._id, motivo || undefined);
      toast.success("Consulta cancelada.");
      onCancelled(updated);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar.");
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    setShowCancelForm(false);
    setMotivo("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={cancelling ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tipoCfg.dot }} />
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
              {tipoCfg.label}
            </Typography>
          </Box>
          <Chip
            label={statusCfg.label}
            size="small"
            sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: 11 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0.5, pb: 1 }}>
        {patientName && (
          <DetailRow icon={<User size={16} />} label="Paciente" value={patientName} />
        )}
        <DetailRow icon={<Calendar size={16} />} label="Data" value={fmtDate} />
        <DetailRow icon={<Clock size={16} />} label="Horário" value={`${fmtTime} · ${appointment.duracao} min`} />

        {appointment.observacoes && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#fffbeb", borderRadius: 1.5, border: "1px solid #fde68a" }}>
            <Typography sx={{ fontSize: 11, color: "#92400e", fontWeight: 700, mb: 0.25 }}>Observações</Typography>
            <Typography sx={{ fontSize: 13, color: "#78350f" }}>{appointment.observacoes}</Typography>
          </Box>
        )}

        {appointment.motivoCancelamento && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#fef2f2", borderRadius: 1.5, border: "1px solid #fecaca" }}>
            <Typography sx={{ fontSize: 11, color: "#991b1b", fontWeight: 700, mb: 0.25 }}>Motivo do cancelamento</Typography>
            <Typography sx={{ fontSize: 13, color: "#7f1d1d" }}>{appointment.motivoCancelamento}</Typography>
          </Box>
        )}

        {/* Formulário de cancelamento inline */}
        {showCancelForm && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Motivo do cancelamento (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              autoFocus
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 1, color: "#6b7280" }}>
          Fechar
        </Button>

        {canCancel && !showCancelForm && (
          <>
            {role === "nutritionist" && onEdit && (
              <Button
                onClick={() => { onEdit(appointment); handleClose(); }}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 1, fontWeight: 700 }}
              >
                Editar
              </Button>
            )}
            <Button
              onClick={() => setShowCancelForm(true)}
              variant="outlined"
              sx={{ borderRadius: 1, fontWeight: 700, color: "#ef4444", borderColor: "#ef4444", "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" } }}
            >
              Cancelar consulta
            </Button>
          </>
        )}

        {showCancelForm && (
          <>
            <Button onClick={() => setShowCancelForm(false)} color="inherit" sx={{ borderRadius: 1, color: "#6b7280" }}>
              Voltar
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="contained"
              sx={{ borderRadius: 1, boxShadow: "none", bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, fontWeight: 700 }}
            >
              {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
