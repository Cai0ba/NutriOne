"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/lib/appointments";

// ─── Config visual ────────────────────────────────────────────────────────────

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export const STATUS_CFG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  agendado:  { label: "Agendado",  color: "#1e40af", bg: "#dbeafe" },
  realizado: { label: "Realizado", color: "#065f46", bg: "#d1fae5" },
  cancelado: { label: "Cancelado", color: "#991b1b", bg: "#fee2e2" },
};

export const TIPO_CFG: Record<AppointmentType, { label: string; dot: string }> = {
  consulta: { label: "Consulta", dot: "#6366f1" },
  retorno:  { label: "Retorno",  dot: "#10b981" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month - 1, 1);
  const last  = new Date(year, month, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month - 1, d));
  return days;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Dot de evento no dia ─────────────────────────────────────────────────────

function EventDot({ appt, onClick }: { appt: Appointment; onClick: () => void }) {
  const cfg = TIPO_CFG[appt.tipo];
  const cancelled = appt.status === "cancelado";
  const patient = typeof appt.patientId === "object" ? appt.patientId.nome : "";

  return (
    <Tooltip title={`${fmtTime(appt.dataHora)} · ${cfg.label}${patient ? ` · ${patient}` : ""}`}>
      <Box
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 0.75,
          py: 0.25,
          borderRadius: 0.75,
          bgcolor: cancelled ? "#f3f4f6" : `${cfg.dot}18`,
          cursor: "pointer",
          "&:hover": { bgcolor: cancelled ? "#e5e7eb" : `${cfg.dot}30` },
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: cancelled ? "#9ca3af" : cfg.dot,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: cancelled ? "#9ca3af" : "#374151",
            textDecoration: cancelled ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fmtTime(appt.dataHora)}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type MonthCalendarProps = {
  year:         number;
  month:        number; // 1-12
  appointments: Appointment[];
  onPrev:       () => void;
  onNext:       () => void;
  onDayClick?:  (date: Date) => void;
  onEventClick: (appt: Appointment) => void;
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function MonthCalendar({
  year, month, appointments,
  onPrev, onNext, onDayClick, onEventClick,
}: MonthCalendarProps) {
  const days  = buildCalendarDays(year, month);
  const today = new Date();

  return (
    <Box>
      {/* Navegação de mês */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <IconButton onClick={onPrev} size="small" sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151" }}>
          <ChevronLeft size={18} />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: -0.3 }}>
          {MONTH_NAMES[month - 1]} {year}
        </Typography>
        <IconButton onClick={onNext} size="small" sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151" }}>
          <ChevronRight size={18} />
        </IconButton>
      </Box>

      {/* Grade do calendário */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Cabeçalho dos dias da semana */}
        {WEEKDAYS.map((wd) => (
          <Box
            key={wd}
            sx={{
              textAlign: "center",
              py: 1,
              bgcolor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              borderRight: "1px solid #f3f4f6",
              "&:last-child": { borderRight: "none" },
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {wd}
            </Typography>
          </Box>
        ))}

        {/* Células dos dias */}
        {days.map((date, idx) => {
          const isToday   = date ? sameDay(date, today) : false;
          const isPast    = date ? date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) : false;
          const dayAppts  = date
            ? appointments.filter((a) => sameDay(new Date(a.dataHora), date))
            : [];

          return (
            <Box
              key={idx}
              onClick={() => date && onDayClick?.(date)}
              sx={{
                minHeight: 90,
                p: 0.75,
                borderRight: "1px solid #f3f4f6",
                borderBottom: "1px solid #f3f4f6",
                "&:nth-of-type(7n)":       { borderRight: "none" },
                "&:nth-last-of-type(-n+7)": { borderBottom: "none" },
                bgcolor: date ? (isToday ? "#eef2ff" : "#fff") : "#fafafa",
                cursor: date && onDayClick ? "pointer" : "default",
                transition: "background 0.15s",
                "&:hover": date && onDayClick ? { bgcolor: isToday ? "#e0e7ff" : "#f9fafb" } : {},
              }}
            >
              {date && (
                <>
                  {/* Número do dia */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: isToday ? "#6366f1" : "transparent",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: isToday ? 800 : isPast ? 400 : 600,
                          color: isToday ? "#fff" : isPast ? "#d1d5db" : "#374151",
                          lineHeight: 1,
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Eventos do dia */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                    {dayAppts.slice(0, 3).map((appt) => (
                      <EventDot key={appt._id} appt={appt} onClick={() => onEventClick(appt)} />
                    ))}
                    {dayAppts.length > 3 && (
                      <Typography sx={{ fontSize: 10, color: "#9ca3af", pl: 0.75 }}>
                        +{dayAppts.length - 3} mais
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Legenda */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        {Object.entries(TIPO_CFG).map(([k, v]) => (
          <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: v.dot }} />
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{v.label}</Typography>
          </Box>
        ))}
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <Chip key={k} label={v.label} size="small"
            sx={{ height: 20, fontSize: 10, bgcolor: v.bg, color: v.color, fontWeight: 700 }}
          />
        ))}
      </Box>
    </Box>
  );
}
