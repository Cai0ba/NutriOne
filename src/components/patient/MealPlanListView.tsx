"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { ChevronRight, Salad } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import type { MealPlanSummary, MealPlanStatus } from "@/lib/diet";
import { listSelfMealPlans } from "@/lib/patient-self";
import { PatientLayout } from "./PatientLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MealPlanStatus, { label: string; color: string; bg: string }> = {
  ativo:    { label: "Ativo",    color: "#065f46", bg: "#d1fae5" },
  rascunho: { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  inativo:  { label: "Inativo",  color: "#374151", bg: "#f3f4f6" },
};

function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: MealPlanSummary }) {
  const cfg = STATUS_CONFIG[plan.status];

  return (
    <Paper
      component={Link}
      href={`/home/diet/${plan._id}`}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: plan.status === "ativo" ? "#10b981" : "#e5e7eb",
        borderRadius: 2,
        p: 2.5,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": {
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          borderColor: plan.status === "ativo" ? "#10b981" : "#d1d5db",
        },
      }}
    >
      {/* Ícone */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: plan.status === "ativo" ? "#d1fae5" : "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Salad size={22} color={plan.status === "ativo" ? "#10b981" : "#9ca3af"} />
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            {plan.nome}
          </Typography>
          <Chip
            label={cfg.label}
            size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11 }}
          />
        </Box>
        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          {fmtDate(plan.dataInicio)} → {fmtDate(plan.dataFim)}
        </Typography>
        {plan.observacoes && (
          <Typography
            sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {plan.observacoes}
          </Typography>
        )}
      </Box>

      <ChevronRight size={18} color="#9ca3af" />
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MealPlanListView() {
  const [plans,   setPlans]   = useState<MealPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const data = await listSelfMealPlans(token);
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Separar ativos dos demais para dar destaque
  const active   = plans.filter((p) => p.status === "ativo");
  const inactive = plans.filter((p) => p.status !== "ativo");

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 800, mx: "auto" }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>
            Meus Planos Alimentares
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
            Planos elaborados pelo seu nutricionista.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : plans.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 6, textAlign: "center" }}
          >
            <Salad size={36} color="#9ca3af" style={{ marginBottom: 10 }} />
            <Typography sx={{ fontSize: 15, color: "#6b7280" }}>
              Nenhum plano alimentar disponível.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af", mt: 0.5 }}>
              Aguarde seu nutricionista elaborar um plano.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Planos ativos */}
            {active.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Plano ativo
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {active.map((p) => <PlanCard key={p._id} plan={p} />)}
                </Box>
              </Box>
            )}

            {/* Outros planos */}
            {inactive.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Outros planos
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {inactive.map((p) => <PlanCard key={p._id} plan={p} />)}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </PatientLayout>
  );
}
