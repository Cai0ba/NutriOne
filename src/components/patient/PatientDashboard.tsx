"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { BarChart3, Calendar, ChevronRight, Salad, Scale, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { getStoredToken, getStoredUser } from "@/lib/auth";
import type { MealPlanSummary } from "@/lib/diet";
import type { PhysicalAssessment } from "@/lib/patients";
import { listSelfAssessments, listSelfMealPlans } from "@/lib/patient-self";
import { PatientLayout } from "./PatientLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function imcLabel(imc: number): { label: string; color: string; bg: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "#92400e", bg: "#fef3c7" };
  if (imc < 25)   return { label: "Peso normal",    color: "#065f46", bg: "#d1fae5" };
  if (imc < 30)   return { label: "Sobrepeso",      color: "#92400e", bg: "#fef3c7" };
  return               { label: "Obesidade",        color: "#991b1b", bg: "#fee2e2" };
}

function fmt(n?: number, decimals = 1) {
  return n != null ? n.toFixed(decimals) : "—";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, trend, chip,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  chip?: { label: string; color: string; bg: string };
}) {
  const up = trend !== undefined && trend > 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;
  const trendColor = label === "Peso" || label === "Gordura corporal"
    ? up ? "#ef4444" : "#10b981"
    : up ? "#10b981" : "#ef4444";

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1.2 }}>
          {value}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
            {unit}
          </Typography>
        )}
      </Box>
      {chip && (
        <Chip label={chip.label} size="small" sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 700, fontSize: 11, width: "fit-content" }} />
      )}
      {trend !== undefined && Math.abs(trend) > 0.01 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendIcon size={13} color={trendColor} />
          <Typography sx={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>
            {trend > 0 ? "+" : ""}{fmt(trend)} {unit}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// ─── Mini gráfico ─────────────────────────────────────────────────────────────

function MiniChart({
  data, color, dataKey,
}: {
  data: { date: string; value: number }[];
  color: string;
  dataKey: string;
}) {
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`mini-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <Tooltip
          contentStyle={{ display: "none" }}
          cursor={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#mini-${dataKey})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Diet plan card ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  ativo:    { label: "Ativo",    color: "#065f46", bg: "#d1fae5" },
  inativo:  { label: "Inativo",  color: "#374151", bg: "#f3f4f6" },
};

function ActivePlanCard({ plan }: { plan: MealPlanSummary }) {
  const cfg = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.inativo;
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : null;

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            {plan.nome}
          </Typography>
          {(fmt(plan.dataInicio) || fmt(plan.dataFim)) && (
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.25 }}>
              {fmt(plan.dataInicio) ?? "—"} → {fmt(plan.dataFim) ?? "—"}
            </Typography>
          )}
        </Box>
        <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11 }} />
      </Box>
      <Button
        component={Link}
        href={`/home/diet/${plan._id}`}
        variant="outlined"
        size="small"
        endIcon={<ChevronRight size={14} />}
        sx={{ borderRadius: 1, fontWeight: 700, mt: 1 }}
      >
        Ver plano completo
      </Button>
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PatientDashboard() {
  const user = getStoredUser();
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [plans,       setPlans]       = useState<MealPlanSummary[]>([]);
  const [loading,     setLoading]     = useState(true);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    const [a, p] = await Promise.allSettled([
      listSelfAssessments(token),
      listSelfMealPlans(token),
    ]);
    if (a.status === "fulfilled") setAssessments(a.value);
    if (p.status === "fulfilled") setPlans(p.value);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Métricas da avaliação mais recente e da anterior (para trend)
  const latest  = assessments[0];
  const prev    = assessments[1];
  const imcInfo = latest ? imcLabel(latest.imc) : null;

  // Dados para mini charts (asc por data)
  const chartData = useMemo(
    () =>
      [...assessments]
        .reverse()
        .map((a) => ({ date: fmtDate(a.createdAt), peso: a.peso, imc: a.imc })),
    [assessments],
  );

  const activePlan = plans.find((p) => p.status === "ativo") ?? plans[0];

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const firstName = user?.nome?.split(" ")[0] ?? "Paciente";

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1000, mx: "auto" }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827" }}>
            {greeting}, {firstName}! 👋
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.5 }}>
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            {assessments.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <StatCard
                  label="Peso"
                  value={fmt(latest?.peso)}
                  unit="kg"
                  trend={latest && prev ? latest.peso - prev.peso : undefined}
                />
                <StatCard
                  label="IMC"
                  value={fmt(latest?.imc)}
                  chip={imcInfo ?? undefined}
                  trend={latest && prev ? latest.imc - prev.imc : undefined}
                />
                <StatCard
                  label="Gordura corporal"
                  value={fmt(latest?.gorduraCorporal)}
                  unit="%"
                  trend={latest && prev && latest.gorduraCorporal != null && prev.gorduraCorporal != null
                    ? latest.gorduraCorporal - prev.gorduraCorporal
                    : undefined}
                />
                <StatCard
                  label="Massa magra"
                  value={fmt(latest?.massaMagra)}
                  unit="kg"
                  trend={latest && prev && latest.massaMagra != null && prev.massaMagra != null
                    ? latest.massaMagra - prev.massaMagra
                    : undefined}
                />
              </Box>
            ) : (
              <Paper elevation={0} sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 4, textAlign: "center", mb: 3 }}>
                <Scale size={32} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Typography sx={{ color: "#6b7280", fontSize: 15 }}>
                  Nenhuma avaliação física registrada ainda.
                </Typography>
                <Typography sx={{ color: "#9ca3af", fontSize: 13, mt: 0.5 }}>
                  Seu nutricionista registrará suas medidas na próxima consulta.
                </Typography>
              </Paper>
            )}

            {/* ── Mini charts + Plano ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 360px" }, gap: 2, mb: 3 }}>
              {/* Peso */}
              <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Peso (kg)</Typography>
                  <Button component={Link} href="/home/evolution" size="small" endIcon={<ChevronRight size={12} />} sx={{ fontSize: 12, p: 0.5 }}>
                    Ver tudo
                  </Button>
                </Box>
                <MiniChart data={chartData.map((d) => ({ date: d.date, value: d.peso }))} color="#10b981" dataKey="peso" />
              </Paper>

              {/* IMC */}
              <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>IMC</Typography>
                  <Button component={Link} href="/home/evolution" size="small" endIcon={<ChevronRight size={12} />} sx={{ fontSize: 12, p: 0.5 }}>
                    Ver tudo
                  </Button>
                </Box>
                <MiniChart data={chartData.map((d) => ({ date: d.date, value: d.imc }))} color="#6366f1" dataKey="imc" />
              </Paper>

              {/* Plano ativo */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Plano alimentar</Typography>
                  <Button component={Link} href="/home/diet" size="small" endIcon={<ChevronRight size={12} />} sx={{ fontSize: 12, p: 0.5 }}>
                    Ver todos
                  </Button>
                </Box>
                {activePlan ? (
                  <ActivePlanCard plan={activePlan} />
                ) : (
                  <Paper elevation={0} sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 3, textAlign: "center" }}>
                    <Salad size={28} color="#9ca3af" style={{ marginBottom: 6 }} />
                    <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>
                      Nenhum plano ativo.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Box>

            {/* ── Atalhos ── */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1.5 }}>
              Acessos rápidos
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              {[
                { label: "Minha evolução", subtitle: `${assessments.length} avaliações`, icon: BarChart3, href: "/home/evolution", color: "#10b981" },
                { label: "Meus planos",    subtitle: `${plans.length} planos`,          icon: Salad,    href: "/home/diet",      color: "#6366f1" },
                { label: "Última avaliação",
                  subtitle: latest ? fmtDate(latest.createdAt) : "Nenhuma",
                  icon: Calendar,
                  href: "/home/evolution",
                  color: "#f97316",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Paper
                    key={item.label}
                    component={Link}
                    href={item.href}
                    elevation={0}
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      p: 2,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "box-shadow 0.15s",
                      "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={20} color={item.color} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </PatientLayout>
  );
}
