"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Clock, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import type { MealPlanDetail, MealPlanStatus, Meal } from "@/lib/diet";
import { getSelfMealPlan } from "@/lib/patient-self";
import { MealPlanDownloadButton } from "./MealPlanDownloadButton";
import { PatientLayout } from "./PatientLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MealPlanStatus, { label: string; color: string; bg: string }> = {
  ativo:    { label: "Ativo",    color: "#065f46", bg: "#d1fae5" },
  rascunho: { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  inativo:  { label: "Inativo",  color: "#374151", bg: "#f3f4f6" },
};

function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : null;
}

// ─── MealSection ──────────────────────────────────────────────────────────────

function MealSection({ meal }: { meal: Meal }) {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <UtensilsCrossed size={18} color="#10b981" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            {meal.nome}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#6b7280" }}>
          <Clock size={14} />
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {meal.horario}
          </Typography>
        </Box>
      </Box>

      {/* Itens */}
      {meal.itens.length === 0 ? (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            Nenhum alimento adicionado.
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* Cabeçalho de colunas */}
          <Box
            sx={{
              display: { xs: "none", sm: "grid" },
              gridTemplateColumns: "1fr 120px 120px 1fr",
              gap: 2,
              px: 2.5,
              py: 1,
              bgcolor: "#fafafa",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            {["Alimento", "Quantidade", "Unidade", "Observação"].map((h) => (
              <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 }}>
                {h}
              </Typography>
            ))}
          </Box>

          {meal.itens.map((item, idx) => (
            <Box key={item._id}>
              <Box
                sx={{
                  display: { xs: "flex", sm: "grid" },
                  flexDirection: { xs: "column", sm: "unset" },
                  gridTemplateColumns: { sm: "1fr 120px 120px 1fr" },
                  gap: { xs: 0.25, sm: 2 },
                  px: 2.5,
                  py: 1.5,
                  "&:hover": { bgcolor: "#f9fafb" },
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                  {item.alimento}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#374151" }}>
                  <Box component="span" sx={{ display: { sm: "none" }, color: "#9ca3af", fontSize: 12 }}>Qtd: </Box>
                  {item.quantidade}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#374151" }}>
                  <Box component="span" sx={{ display: { sm: "none" }, color: "#9ca3af", fontSize: 12 }}>Unidade: </Box>
                  {item.unidade}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                  {item.observacao || "—"}
                </Typography>
              </Box>
              {idx < meal.itens.length - 1 && <Divider sx={{ mx: 2.5 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MealPlanViewer({ planId }: { planId: string }) {
  const router = useRouter();
  const [plan,    setPlan]    = useState<MealPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const data = await getSelfMealPlan(token, planId);
      setPlan(data);
    } catch {
      setError("Não foi possível carregar o plano alimentar.");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => { load(); }, [load]);

  // Ordenar refeições por horário
  const meals = plan
    ? [...plan.refeicoes].sort((a, b) => a.horario.localeCompare(b.horario))
    : [];

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography sx={{ color: "#ef4444" }}>{error}</Typography>
        ) : plan ? (
          <>
            {/* Cabeçalho */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <Tooltip title="Voltar para meus planos">
                <IconButton
                  onClick={() => router.push("/home/diet")}
                  sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151", mt: 0.25 }}
                >
                  <ArrowLeft size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>
                    {plan.nome}
                  </Typography>
                  <Chip
                    label={STATUS_CONFIG[plan.status].label}
                    size="small"
                    sx={{
                      bgcolor: STATUS_CONFIG[plan.status].bg,
                      color: STATUS_CONFIG[plan.status].color,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 3, mt: 0.75, flexWrap: "wrap" }}>
                  {(fmtDate(plan.dataInicio) || fmtDate(plan.dataFim)) && (
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                      {fmtDate(plan.dataInicio) ?? "—"} → {fmtDate(plan.dataFim) ?? "—"}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                    {meals.length} refeição{meals.length !== 1 ? "ões" : ""}
                  </Typography>
                </Box>

                {plan.observacoes && (
                  <Paper
                    elevation={0}
                    sx={{ border: "1px solid #fde68a", bgcolor: "#fffbeb", borderRadius: 1.5, px: 2, py: 1.25, mt: 1.5 }}
                  >
                    <Typography sx={{ fontSize: 13, color: "#92400e" }}>
                      <strong>Observação:</strong> {plan.observacoes}
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Botão de download */}
              <MealPlanDownloadButton plan={plan} />
            </Box>

            {/* Refeições */}
            {meals.length === 0 ? (
              <Paper elevation={0} sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 5, textAlign: "center" }}>
                <Typography sx={{ color: "#9ca3af" }}>
                  Este plano ainda não possui refeições.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {meals.map((meal) => (
                  <MealSection key={meal._id} meal={meal} />
                ))}
              </Box>
            )}
          </>
        ) : null}
      </Box>
    </PatientLayout>
  );
}
