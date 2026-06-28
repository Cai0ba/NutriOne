"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MetricLineChart, type ChartDataPoint } from "@/components/charts/MetricLineChart";
import { getStoredToken } from "@/lib/auth";
import type { PhysicalAssessment } from "@/lib/patients";
import { listSelfAssessments } from "@/lib/patient-self";
import { PatientLayout } from "./PatientLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function imcClass(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "#f59e0b" };
  if (imc < 25)   return { label: "Normal",          color: "#10b981" };
  if (imc < 30)   return { label: "Sobrepeso",       color: "#f97316" };
  return               { label: "Obesidade",         color: "#ef4444" };
}

function toChartData(
  assessments: PhysicalAssessment[],
  key: keyof PhysicalAssessment,
): ChartDataPoint[] {
  return [...assessments]
    .reverse()
    .filter((a) => a[key] != null)
    .map((a) => ({
      date:  new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      value: a[key] as number,
    }));
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PatientEvolutionView() {
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const data = await listSelfAssessments(token);
      setAssessments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pesoData    = useMemo(() => toChartData(assessments, "peso"),            [assessments]);
  const imcData     = useMemo(() => toChartData(assessments, "imc"),             [assessments]);
  const gorduraData = useMemo(() => toChartData(assessments, "gorduraCorporal"), [assessments]);
  const magrasData  = useMemo(() => toChartData(assessments, "massaMagra"),      [assessments]);

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1100, mx: "auto" }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>
            Minha Evolução
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
            Acompanhe o histórico das suas avaliações físicas.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : assessments.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 6, textAlign: "center" }}
          >
            <Typography sx={{ fontSize: 15, color: "#6b7280" }}>
              Nenhuma avaliação registrada ainda.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af", mt: 0.5 }}>
              Seu nutricionista registrará suas medidas na próxima consulta.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Gráficos 2×2 */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
              <MetricLineChart
                title="Peso"
                unit="kg"
                data={pesoData}
                color="#10b981"
              />
              <MetricLineChart
                title="IMC"
                unit=""
                data={imcData}
                color="#6366f1"
                referenceLines={[
                  { y: 18.5, label: "Abaixo do peso", color: "#f59e0b" },
                  { y: 25,   label: "Sobrepeso",       color: "#f97316" },
                  { y: 30,   label: "Obesidade",       color: "#ef4444" },
                ]}
              />
              <MetricLineChart
                title="Gordura corporal"
                unit="%"
                data={gorduraData}
                color="#f97316"
              />
              <MetricLineChart
                title="Massa magra"
                unit="kg"
                data={magrasData}
                color="#8b5cf6"
              />
            </Box>

            {/* Tabela de histórico */}
            <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid #f3f4f6" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                  Histórico de avaliações
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f9fafb", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 } }}>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Peso</TableCell>
                      <TableCell align="right">Altura</TableCell>
                      <TableCell align="right">IMC</TableCell>
                      <TableCell>Classificação</TableCell>
                      <TableCell align="right">Gordura</TableCell>
                      <TableCell align="right">Massa magra</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assessments.map((a, idx) => {
                      const cls = imcClass(a.imc);
                      return (
                        <TableRow
                          key={a._id}
                          sx={{
                            bgcolor: idx === 0 ? "#f0fdf4" : "inherit",
                            "& td": { fontSize: 13, color: "#374151" },
                          }}
                        >
                          <TableCell sx={{ fontWeight: idx === 0 ? 700 : 400 }}>
                            {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell align="right">{a.peso} kg</TableCell>
                          <TableCell align="right">{a.altura} cm</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{a.imc}</TableCell>
                          <TableCell>
                            <Chip
                              label={cls.label}
                              size="small"
                              sx={{ bgcolor: `${cls.color}18`, color: cls.color, fontWeight: 700, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell align="right">{a.gorduraCorporal != null ? `${a.gorduraCorporal}%` : "—"}</TableCell>
                          <TableCell align="right">{a.massaMagra != null ? `${a.massaMagra} kg` : "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </PatientLayout>
  );
}
