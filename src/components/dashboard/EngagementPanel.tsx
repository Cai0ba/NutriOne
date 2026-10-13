"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { BarChart2, CalendarPlus, CheckCircle2, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  RISK_CFG,
  type EngagementPatient,
  type EngagementResponse,
} from "@/lib/engagement";

const COLLAPSED_COUNT = 5;

function getInitials(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

type EngagementPanelProps = {
  data: EngagementResponse | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onMessage: (patientId: string) => void;
  onScheduleReturn: (patientId: string) => void;
  onEvolution: (patientId: string) => void;
};

function PatientRow({
  patient,
  onMessage,
  onScheduleReturn,
  onEvolution,
}: {
  patient: EngagementPatient;
} & Pick<EngagementPanelProps, "onMessage" | "onScheduleReturn" | "onEvolution">) {
  const cfg = RISK_CFG[patient.nivelRisco];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        gap: 1.5,
        py: 1.5,
        borderTop: "1px solid #f3f4f6",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: cfg.bg, color: cfg.color, fontSize: 13, fontWeight: 800 }}>
          {getInitials(patient.nome)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
              {patient.nome}
            </Typography>
            <Chip
              label={cfg.label}
              size="small"
              sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11 }}
            />
          </Box>
          <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2, color: "#6b7280", fontSize: 13 }}>
            {patient.motivos.map((m) => (
              <li key={m.codigo}>{m.texto}</li>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MessageCircle size={14} />}
          onClick={() => onMessage(patient.patientId)}
          sx={{ fontSize: 12, borderColor: "#e5e7eb", color: "#374151" }}
        >
          Mensagem
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CalendarPlus size={14} />}
          onClick={() => onScheduleReturn(patient.patientId)}
          sx={{ fontSize: 12, borderColor: "#e5e7eb", color: "#10b981" }}
        >
          Agendar retorno
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<BarChart2 size={14} />}
          onClick={() => onEvolution(patient.patientId)}
          sx={{ fontSize: 12, borderColor: "#e5e7eb", color: "#8b5cf6" }}
        >
          Evolução
        </Button>
      </Box>
    </Box>
  );
}

export function EngagementPanel({
  data,
  loading,
  error,
  onRetry,
  onMessage,
  onScheduleReturn,
  onEvolution,
}: EngagementPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading && !data) {
    return (
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 3, mb: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={24} color="primary" />
      </Paper>
    );
  }

  if (error && !data) {
    return (
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5, mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
          Não foi possível carregar o acompanhamento dos pacientes.
        </Typography>
        <Button size="small" onClick={onRetry}>Tentar de novo</Button>
      </Paper>
    );
  }

  if (!data || data.resumo.total === 0) return null;

  const needsAttention = data.patients.filter((p) => p.nivelRisco !== "ok");
  const visible = expanded ? needsAttention : needsAttention.slice(0, COLLAPSED_COUNT);
  const hidden = needsAttention.length - visible.length;

  return (
    <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: { xs: 2, md: 2.5 }, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: needsAttention.length ? 1 : 0 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 850, color: "#111827" }}>
            Acompanhamento
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Pacientes que merecem o seu contato agora
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {(["alto", "atencao", "ok"] as const).map((level) => (
            <Chip
              key={level}
              label={`${data.resumo[level]} ${RISK_CFG[level].label.toLowerCase()}`}
              size="small"
              sx={{ bgcolor: RISK_CFG[level].bg, color: RISK_CFG[level].color, fontWeight: 700, fontSize: 12 }}
            />
          ))}
        </Box>
      </Box>

      {needsAttention.length === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, color: "#065f46" }}>
          <CheckCircle2 size={18} />
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            Todos os pacientes estão em dia.
          </Typography>
        </Box>
      ) : (
        <>
          {visible.map((p) => (
            <PatientRow
              key={p.patientId}
              patient={p}
              onMessage={onMessage}
              onScheduleReturn={onScheduleReturn}
              onEvolution={onEvolution}
            />
          ))}
          {(hidden > 0 || expanded) && needsAttention.length > COLLAPSED_COUNT && (
            <Button size="small" onClick={() => setExpanded((e) => !e)} sx={{ mt: 1 }}>
              {expanded ? "Mostrar menos" : `Ver mais ${hidden}`}
            </Button>
          )}
        </>
      )}
    </Paper>
  );
}
