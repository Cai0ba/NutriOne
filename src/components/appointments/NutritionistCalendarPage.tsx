"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { CalendarPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getStoredToken, getStoredUser } from "@/lib/auth";
import {
  listAppointments,
  type Appointment,
} from "@/lib/appointments";
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import { AppointmentFormModal } from "./AppointmentFormModal";
import { MonthCalendar } from "./MonthCalendar";

// ─── Stats do mês ─────────────────────────────────────────────────────────────

function MonthStats({ appointments }: { appointments: Appointment[] }) {
  const total     = appointments.length;
  const agendados = appointments.filter((a) => a.status === "agendado").length;
  const realizados= appointments.filter((a) => a.status === "realizado").length;
  const cancelados= appointments.filter((a) => a.status === "cancelado").length;

  const stat = (label: string, value: number, color: string) => (
    <Box key={label} sx={{ textAlign: "center", flex: 1 }}>
      <Typography sx={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25 }}>{label}</Typography>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5, mb: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {stat("Total", total, "#111827")}
        {stat("Agendadas", agendados, "#1e40af")}
        {stat("Realizadas", realizados, "#065f46")}
        {stat("Canceladas", cancelados, "#991b1b")}
      </Box>
    </Paper>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function NutritionistCalendarPage() {
  const userName = getStoredUser()?.nome?.split(" ")[0] ?? "Nutricionista";
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [formOpen,    setFormOpen]    = useState(false);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [selected,    setSelected]    = useState<Appointment | null>(null);
  const [editTarget,  setEditTarget]  = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments(token, year, month);
      setAppointments(data);
    } catch {
      setError("Não foi possível carregar as consultas.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const handleDayClick = (date: Date) => {
    setDefaultDate(date);
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEventClick = (appt: Appointment) => {
    setSelected(appt);
    setDetailOpen(true);
  };

  const handleSaved = (appt: Appointment) => {
    setAppointments((prev) => {
      const idx = prev.findIndex((a) => a._id === appt._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = appt;
        return updated;
      }
      return [...prev, appt];
    });
  };

  const handleCancelled = (appt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a._id === appt._id ? appt : a)));
  };

  return (
    <DashboardLayout userName={userName}>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1000, mx: "auto" }}>
        {/* Cabeçalho */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>Agenda</Typography>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Gerencie suas consultas e retornos</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalendarPlus size={16} />}
            onClick={() => { setEditTarget(null); setDefaultDate(new Date()); setFormOpen(true); }}
            sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
          >
            Nova consulta
          </Button>
        </Box>

        {/* Stats */}
        {!loading && !error && <MonthStats appointments={appointments} />}

        {/* Calendário */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 3 }}>
            <MonthCalendar
              year={year}
              month={month}
              appointments={appointments}
              onPrev={prevMonth}
              onNext={nextMonth}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          </Paper>
        )}
      </Box>

      {/* Modais */}
      <AppointmentFormModal
        open={formOpen}
        appointment={editTarget}
        defaultDate={defaultDate}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
      <AppointmentDetailModal
        open={detailOpen}
        appointment={selected}
        role="nutritionist"
        onClose={() => setDetailOpen(false)}
        onEdit={(appt) => { setEditTarget(appt); setFormOpen(true); setDetailOpen(false); }}
        onCancelled={handleCancelled}
      />
    </DashboardLayout>
  );
}
