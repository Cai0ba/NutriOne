"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import { listSelfAppointments, type Appointment } from "@/lib/appointments";
import { PatientLayout } from "../patient/PatientLayout";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import { MonthCalendar } from "./MonthCalendar";

// ─── Próximas consultas ────────────────────────────────────────────────────────

function UpcomingList({ appointments, onSelect }: { appointments: Appointment[]; onSelect: (a: Appointment) => void }) {
  const upcoming = appointments
    .filter((a) => a.status === "agendado" && new Date(a.dataHora) >= new Date())
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#374151", mb: 1.5 }}>
        Próximas consultas
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {upcoming.map((appt) => {
          const d = new Date(appt.dataHora);
          const fmtDate = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
          const fmtTime = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          return (
            <Paper
              key={appt._id}
              elevation={0}
              onClick={() => onSelect(appt)}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1.5,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#6366f1", bgcolor: "#f5f3ff" },
              }}
            >
              <Box
                sx={{
                  minWidth: 44,
                  height: 44,
                  borderRadius: 1.5,
                  bgcolor: appt.tipo === "consulta" ? "#eef2ff" : "#d1fae5",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: 16, fontWeight: 900, color: appt.tipo === "consulta" ? "#6366f1" : "#10b981", lineHeight: 1 }}>
                  {d.getDate()}
                </Typography>
                <Typography sx={{ fontSize: 9, color: appt.tipo === "consulta" ? "#6366f1" : "#10b981", fontWeight: 700, textTransform: "uppercase" }}>
                  {d.toLocaleString("pt-BR", { month: "short" })}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {appt.tipo === "consulta" ? "Consulta" : "Retorno"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {fmtDate} · {fmtTime} · {appt.duracao} min
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PatientCalendarPage() {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [selected,   setSelected]   = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listSelfAppointments(token, year, month);
      setAppointments(data);
    } catch {
      setError("Não foi possível carregar suas consultas.");
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

  const handleCancelled = (appt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a._id === appt._id ? appt : a)));
  };

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>Minhas consultas</Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Visualize e gerencie seus agendamentos</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <UpcomingList appointments={appointments} onSelect={(a) => { setSelected(a); setDetailOpen(true); }} />
            <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 3 }}>
              <MonthCalendar
                year={year}
                month={month}
                appointments={appointments}
                onPrev={prevMonth}
                onNext={nextMonth}
                onEventClick={(a) => { setSelected(a); setDetailOpen(true); }}
              />
            </Paper>
          </>
        )}
      </Box>

      <AppointmentDetailModal
        open={detailOpen}
        appointment={selected}
        role="patient"
        onClose={() => setDetailOpen(false)}
        onCancelled={handleCancelled}
      />
    </PatientLayout>
  );
}
