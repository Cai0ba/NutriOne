"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Pencil, Plus, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MetricLineChart, type ChartDataPoint } from "@/components/charts/MetricLineChart";
import { getStoredToken, type Patient } from "@/lib/auth";
import { listAssessments, type PhysicalAssessment } from "@/lib/patients";
import { DashboardLayout } from "./DashboardLayout";
import { EditAssessmentModal } from "./EditAssessmentModal";
import { NewAssessmentModal } from "./NewAssessmentModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function imcClass(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso",     color: "#3b82f6" };
  if (imc < 25)   return { label: "Peso normal",        color: "#10b981" };
  if (imc < 30)   return { label: "Sobrepeso",          color: "#f59e0b" };
  if (imc < 35)   return { label: "Obesidade grau I",   color: "#f97316" };
  if (imc < 40)   return { label: "Obesidade grau II",  color: "#ef4444" };
  return                  { label: "Obesidade grau III", color: "#7f1d1d" };
}

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatDateFull(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function toChartData(
  assessments: PhysicalAssessment[],
  key: keyof PhysicalAssessment,
  labelFn?: (a: PhysicalAssessment) => string,
): ChartDataPoint[] {
  return [...assessments]
    .reverse()
    .map((a) => ({
      date: a.createdAt,
      value: a[key] != null ? Number(a[key]) : null,
      label: labelFn?.(a),
    }));
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, color = "#111827", chip,
}: {
  label: string;
  value?: number | null;
  unit: string;
  color?: string;
  chip?: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 850, color, lineHeight: 1 }}>
          {value != null ? value : "—"}
        </Typography>
        {value != null && (
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>{unit}</Typography>
        )}
      </Box>
      {chip}
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type PatientEvolutionPageProps = {
  patient: Patient;
};

export function PatientEvolutionPage({ patient }: PatientEvolutionPageProps) {
  const router = useRouter();
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [newOpen, setNewOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState<PhysicalAssessment | null>(null);

  const fetchAssessments = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const data = await listAssessments(token, patient.id);
      setAssessments(data);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const handleCreated = (a: PhysicalAssessment) =>
    setAssessments((prev) => [a, ...prev]);

  const handleUpdated = (updated: PhysicalAssessment) => {
    setAssessments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    setEditTarget(null);
  };

  const latest  = assessments[0] ?? null;
  const imcCls  = latest ? imcClass(latest.imc) : null;

  const pesoData       = toChartData(assessments, "peso");
  const imcData        = toChartData(assessments, "imc", (a) => imcClass(a.imc).label);
  const gorduraData    = toChartData(assessments, "gorduraCorporal");
  const massaMagraData = toChartData(assessments, "massaMagra");

  return (
    <DashboardLayout userName={patient.email.split("@")[0]}>
      <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>

        {/* ── Header ── */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => router.push("/nutritionist/dashboard")}
              sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151", flexShrink: 0 }}
            >
              <ArrowLeft size={18} />
            </IconButton>
            <Avatar sx={{ width: 44, height: 44, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
              {getInitials(patient.nome)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 850, color: "#111827", lineHeight: 1.2 }}>
                {patient.nome}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                {assessments.length} avaliação{assessments.length !== 1 ? "ões" : ""}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Utensils size={16} />}
              onClick={() => router.push(`/nutritionist/patients/${patient.id}/diet`)}
              sx={{ borderRadius: 1, fontWeight: 700, color: "#6366f1", borderColor: "#6366f1", "&:hover": { borderColor: "#4f46e5", bgcolor: "#eef2ff" } }}
            >
              Plano Alimentar
            </Button>
            <Button
              variant="contained" color="primary"
              startIcon={<Plus size={16} />}
              onClick={() => setNewOpen(true)}
              sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
            >
              Nova Avaliação
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* ── StatCards ── */}
            {latest && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
                <StatCard label="Peso atual"      value={latest.peso}                   unit="kg" />
                <StatCard
                  label="IMC" value={latest.imc} unit="" color={imcCls?.color}
                  chip={imcCls && (
                    <Chip label={imcCls.label} size="small" sx={{ bgcolor: imcCls.color + "22", color: imcCls.color, fontWeight: 700, fontSize: 11, border: `1px solid ${imcCls.color}44`, alignSelf: "flex-start" }} />
                  )}
                />
                <StatCard label="Gordura corporal" value={latest.gorduraCorporal ?? null} unit="%" />
                <StatCard label="Massa magra"      value={latest.massaMagra      ?? null} unit="kg" />
              </Box>
            )}

            {/* ── Gráficos ── */}
            {assessments.length < 2 ? (
              <Paper elevation={0} sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 5, textAlign: "center", mb: 3 }}>
                <Typography sx={{ color: "#6b7280", fontSize: 15 }}>
                  {assessments.length === 0
                    ? "Nenhuma avaliação registrada. Clique em \"Nova Avaliação\" para começar."
                    : "Registre pelo menos 2 avaliações para visualizar os gráficos de evolução."}
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                <MetricLineChart title="Peso"            unit="kg" data={pesoData}       color="#10b981" />
                <MetricLineChart
                  title="IMC" unit="" data={imcData} color="#6366f1"
                  formatValue={(v) => v.toFixed(1)}
                  referenceLines={[
                    { y: 18.5, label: "Abaixo do peso", color: "#3b82f6" },
                    { y: 25,   label: "Sobrepeso",      color: "#f59e0b" },
                    { y: 30,   label: "Obesidade",      color: "#ef4444" },
                  ]}
                />
                <MetricLineChart title="Gordura Corporal" unit="%" data={gorduraData}    color="#f97316" />
                <MetricLineChart title="Massa Magra"      unit="kg" data={massaMagraData} color="#8b5cf6" />
              </Box>
            )}

            {/* ── Histórico de avaliações ── */}
            {assessments.length > 0 && (
              <>
                <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 16, mb: 1.5 }}>
                  Histórico de Avaliações
                </Typography>

                {/* MOBILE: cards */}
                <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5 }}>
                  {assessments.map((a, idx) => {
                    const cls = imcClass(a.imc);
                    return (
                      <Paper key={a._id} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2, bgcolor: idx === 0 ? "#f0fdf4" : "#fff" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
                              {formatDateFull(a.createdAt)}
                            </Typography>
                            {idx === 0 && <Chip label="Atual" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: 10 }} />}
                          </Box>
                          <IconButton size="small" sx={{ color: "#6b7280" }} onClick={() => setEditTarget(a)}>
                            <Pencil size={15} />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.25 }}>
                          {[
                            { label: "Peso",       value: `${a.peso} kg`  },
                            { label: "Altura",     value: `${a.altura} cm` },
                            { label: "IMC",        value: a.imc.toFixed(1), color: cls.color },
                            { label: "Gordura",    value: a.gorduraCorporal != null ? `${a.gorduraCorporal}%` : "—" },
                            { label: "Massa magra",value: a.massaMagra != null ? `${a.massaMagra} kg` : "—" },
                            { label: "Circunf.",   value: a.circunferencia != null ? `${a.circunferencia} cm` : "—" },
                          ].map(({ label, value, color }) => (
                            <Box key={label}>
                              <Typography sx={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>{label}</Typography>
                              <Typography sx={{ fontSize: 15, fontWeight: 700, color: color ?? "#111827" }}>{value}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>

                {/* DESKTOP: tabela */}
                <TableContainer component={Paper} elevation={0} sx={{ display: { xs: "none", md: "block" }, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f9fafb" }}>
                        {["Data", "Peso", "Altura", "IMC", "Gordura", "Massa Magra", "Circunf.", ""].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: "#374151", fontSize: 13 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assessments.map((a, idx) => {
                        const cls = imcClass(a.imc);
                        return (
                          <TableRow key={a._id} sx={{ "&:last-child td": { border: 0 }, bgcolor: idx === 0 ? "#f0fdf4" : "transparent" }}>
                            <TableCell sx={{ fontSize: 13 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {formatDateFull(a.createdAt)}
                                {idx === 0 && <Chip label="Atual" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: 10 }} />}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: "#374151" }}>{a.peso} kg</TableCell>
                            <TableCell sx={{ fontSize: 13, color: "#374151" }}>{a.altura} cm</TableCell>
                            <TableCell>
                              <Chip label={a.imc.toFixed(1)} size="small" sx={{ bgcolor: cls.color + "22", color: cls.color, fontWeight: 700, fontSize: 12, border: `1px solid ${cls.color}44` }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: "#374151" }}>{a.gorduraCorporal != null ? `${a.gorduraCorporal}%` : "—"}</TableCell>
                            <TableCell sx={{ fontSize: 13, color: "#374151" }}>{a.massaMagra != null ? `${a.massaMagra} kg` : "—"}</TableCell>
                            <TableCell sx={{ fontSize: 13, color: "#374151" }}>{a.circunferencia != null ? `${a.circunferencia} cm` : "—"}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Editar avaliação">
                                <IconButton size="small" sx={{ color: "#6b7280" }} onClick={() => setEditTarget(a)}>
                                  <Pencil size={15} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Box>

      <NewAssessmentModal
        open={newOpen} patientId={patient.id} patientName={patient.nome}
        onClose={() => setNewOpen(false)} onCreated={handleCreated}
      />

      {editTarget && (
        <EditAssessmentModal
          open={Boolean(editTarget)} assessment={editTarget}
          patientId={patient.id} patientName={patient.nome}
          onClose={() => setEditTarget(null)} onUpdated={handleUpdated}
        />
      )}
    </DashboardLayout>
  );
}
