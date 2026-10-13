"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { getMyPatients, getStoredToken, type Patient } from "@/lib/auth";
import { createAppointment, updateAppointment, type Appointment, type AppointmentStatus } from "@/lib/appointments";
import { toast } from "sonner";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  patientId:   z.string().min(1, "Selecione o paciente."),
  tipo:        z.enum(["consulta", "retorno"]),
  data:        z.string().min(1, "Informe a data."),
  hora:        z.string().min(1, "Informe o horário."),
  duracao:     z.number().min(15).max(240),
  observacoes: z.string().optional(),
  status:      z.enum(["agendado", "realizado", "cancelado", "faltou"]).optional(),
});

type FormValues = z.infer<typeof schema>;

/** YYYY-MM-DD no fuso local (toISOString usaria UTC e deslocaria o dia à noite). */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:            boolean;
  appointment?:    Appointment | null; // null = criar
  defaultDate?:    Date | null;
  /** Paciente já selecionado ao criar (ex.: atalho do painel de acompanhamento). */
  defaultPatientId?: string;
  onClose:         () => void;
  onSaved:         (appt: Appointment) => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function AppointmentFormModal({ open, appointment, defaultDate, defaultPatientId, onClose, onSaved }: Props) {
  const isEdit = Boolean(appointment);
  const [patients, setPatients] = useState<Patient[]>([]);

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        patientId:   "",
        tipo:        "consulta",
        data:        defaultDate ? toLocalDateString(defaultDate) : "",
        hora:        "09:00",
        duracao:     60,
        observacoes: "",
        status:      "agendado",
      },
    });

  // Carrega pacientes
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    getMyPatients(token).then((r) => setPatients(r.patients)).catch(() => {});
  }, []);

  // Preenche ao editar
  useEffect(() => {
    if (!open) return;
    if (appointment) {
      const d = new Date(appointment.dataHora);
      reset({
        patientId:   typeof appointment.patientId === "object"
          ? appointment.patientId._id
          : appointment.patientId,
        tipo:        appointment.tipo,
        data:        toLocalDateString(d),
        hora:        d.toTimeString().slice(0, 5),
        duracao:     appointment.duracao,
        observacoes: appointment.observacoes ?? "",
        status:      appointment.status,
      });
    } else {
      reset({
        patientId:   defaultPatientId ?? "",
        tipo:        "consulta",
        data:        toLocalDateString(defaultDate ?? new Date()),
        hora:        "09:00",
        duracao:     60,
        observacoes: "",
        status:      "agendado",
      });
    }
  }, [open, appointment, defaultDate, defaultPatientId, reset]);

  const onSubmit = async (values: FormValues) => {
    const token = getStoredToken();
    if (!token) return;

    const dataHora = new Date(`${values.data}T${values.hora}:00`).toISOString();

    try {
      let saved: Appointment;
      if (isEdit && appointment) {
        saved = await updateAppointment(token, appointment._id, {
          patientId:   values.patientId,
          tipo:        values.tipo,
          status:      values.status as AppointmentStatus,
          dataHora,
          duracao:     values.duracao,
          observacoes: values.observacoes || undefined,
        });
        toast.success("Consulta atualizada!");
      } else {
        saved = await createAppointment(token, {
          patientId:   values.patientId,
          tipo:        values.tipo,
          dataHora,
          duracao:     values.duracao,
          observacoes: values.observacoes || undefined,
        });
        toast.success("Consulta agendada!");
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar consulta.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
          {isEdit ? "Editar consulta" : "Nova consulta"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1.5 }}>
        <Box component="form" id="appt-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Paciente */}
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.patientId)} sx={{ mb: 2 }}>
                <InputLabel>Paciente</InputLabel>
                <Select {...field} label="Paciente">
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.patientId?.message}</FormHelperText>
              </FormControl>
            )}
          />

          {/* Tipo + Status */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select {...field} label="Tipo">
                    <MenuItem value="consulta">Consulta</MenuItem>
                    <MenuItem value="retorno">Retorno</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="agendado">Agendado</MenuItem>
                      <MenuItem value="realizado">Realizado</MenuItem>
                      <MenuItem value="cancelado">Cancelado</MenuItem>
                      <MenuItem value="faltou">Faltou</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            )}
          </Box>

          {/* Data + Hora + Duração */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2 }}>
            <TextField
              {...register("data")}
              label="Data"
              type="date"
              size="small"
              fullWidth
              error={Boolean(errors.data)}
              helperText={errors.data?.message}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              {...register("hora")}
              label="Horário"
              type="time"
              size="small"
              fullWidth
              error={Boolean(errors.hora)}
              helperText={errors.hora?.message}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Controller
              name="duracao"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Duração</InputLabel>
                  <Select
                    {...field}
                    label="Duração"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <MenuItem value={30}>30 min</MenuItem>
                    <MenuItem value={45}>45 min</MenuItem>
                    <MenuItem value={60}>1 hora</MenuItem>
                    <MenuItem value={90}>1h 30min</MenuItem>
                    <MenuItem value={120}>2 horas</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Observações */}
          <TextField
            {...register("observacoes")}
            label="Observações"
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Ex: Paciente em jejum, trazer exames..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit" sx={{ borderRadius: 1, color: "#6b7280" }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="appt-form"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
        >
          {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Agendar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
