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
import { BarChart2, Eye, Pencil, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyPatients,
  getStoredToken,
  getStoredUser,
  type AuthMeResponse,
  type Patient,
} from "@/lib/auth";
import { getEngagement, RISK_CFG, type EngagementPatient, type EngagementResponse } from "@/lib/engagement";
import { AppointmentFormModal } from "../appointments/AppointmentFormModal";
import { DashboardLayout } from "./DashboardLayout";
import { EngagementPanel } from "./EngagementPanel";
import { PatientProfileModal } from "./PatientProfileModal";
import { UserRegistrationModal } from "./UserRegistrationModal";

type NutritionistDashboardProps = {
  session: AuthMeResponse;
};

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export function NutritionistDashboard({ session }: NutritionistDashboardProps) {
  const router = useRouter();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profileModalMode, setProfileModalMode] = useState<"view" | "edit">("view");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementResponse | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(true);
  const [engagementError, setEngagementError] = useState(false);
  const [scheduleForPatientId, setScheduleForPatientId] = useState<string | null>(null);

  const openProfile = (patient: Patient, mode: "view" | "edit" = "view") => {
    setSelectedPatient(patient);
    setProfileModalMode(mode);
    setProfileModalOpen(true);
  };

  const fetchPatients = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const response = await getMyPatients(token);
      setPatients(response.patients);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega o acompanhamento incrementando a chave (usado no "tentar de novo" e após agendar).
  const [engagementKey, setEngagementKey] = useState(0);
  const refreshEngagement = () => setEngagementKey((k) => k + 1);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    let cancelled = false;

    getEngagement(token)
      .then((data) => {
        if (cancelled) return;
        setEngagement(data);
        setEngagementError(false);
      })
      .catch(() => {
        if (!cancelled) setEngagementError(true);
      })
      .finally(() => {
        if (!cancelled) setEngagementLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [engagementKey]);

  const riskByPatient = new Map<string, EngagementPatient>(
    (engagement?.patients ?? []).map((p) => [p.patientId, p]),
  );

  const renderRiskChip = (patientId: string) => {
    const risk = riskByPatient.get(patientId);
    if (!risk) return null;
    const cfg = RISK_CFG[risk.nivelRisco];
    return (
      <Tooltip title={risk.motivos.length ? risk.motivos.map((m) => m.texto).join(" · ") : "Sem pendências"}>
        <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 12 }} />
      </Tooltip>
    );
  };

  const handlePatientCreated = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
  };

  const storedUser  = getStoredUser();
  const displayName = storedUser?.nome?.split(" ")[0] ?? session.email.split("@")[0];

  return (
    <DashboardLayout userName={displayName}>
      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            mb: 5,
            display: "flex",
            alignItems: { sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ color: "#111827", fontWeight: 850, mb: 0.5 }}
            >
              Meus Pacientes
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 16 }}>
              {patients.length > 0
                ? `${patients.length} paciente${patients.length > 1 ? "s" : ""} cadastrado${patients.length > 1 ? "s" : ""}`
                : "Nenhum paciente cadastrado ainda"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<UserPlus size={18} />}
            onClick={() => setIsRegistrationOpen(true)}
            sx={{
              px: 2.5,
              py: 1.2,
              borderRadius: 1,
              fontSize: 15,
              boxShadow: "none",
              whiteSpace: "nowrap",
              "&:hover": { boxShadow: "none" },
            }}
          >
            + Adicionar Paciente
          </Button>
        </Box>

        <EngagementPanel
          data={engagement}
          loading={engagementLoading}
          error={engagementError}
          onRetry={() => {
            setEngagementLoading(true);
            setEngagementError(false);
            refreshEngagement();
          }}
          onMessage={(id) => router.push(`/nutritionist/messages?patientId=${id}`)}
          onScheduleReturn={setScheduleForPatientId}
          onEvolution={(id) => router.push(`/nutritionist/patients/${id}`)}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : patients.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 620,
              mx: "auto",
              px: { xs: 3, sm: 6 },
              py: { xs: 5, sm: 7 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#d1fae5",
                color: "primary.dark",
                borderRadius: "50%",
                mb: 3,
              }}
            >
              <UserPlus aria-hidden size={34} strokeWidth={2.1} />
            </Box>
            <Typography
              component="h2"
              variant="h5"
              sx={{ color: "#111827", fontWeight: 850, mb: 1.25 }}
            >
              Nenhum paciente ainda
            </Typography>
            <Typography
              sx={{
                maxWidth: 470,
                color: "#6b7280",
                fontSize: 16,
                lineHeight: 1.65,
              }}
            >
              Comece adicionando seu primeiro paciente. Você poderá acompanhar o
              progresso e criar planos alimentares personalizados.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* ── MOBILE: cards ── */}
            <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5 }}>
              {patients.map((patient) => (
                <Paper
                  key={patient.id}
                  elevation={0}
                  sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
                    <Avatar sx={{ width: 42, height: 42, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 15, fontWeight: 700 }}>
                      {getInitials(patient.nome)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                        {patient.nome}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: 13, color: "#6b7280" }}>
                        {patient.email}
                      </Typography>
                    </Box>
                    {patient.mustChangePassword ? (
                      <Chip label="Aguardando" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 11 }} />
                    ) : (
                      <Chip label="Ativo" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: 11 }} />
                    )}
                  </Box>
                  <Box sx={{ mb: 0.5 }}>{renderRiskChip(patient.id)}</Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BarChart2 size={14} />}
                      onClick={() => router.push(`/nutritionist/patients/${patient.id}`)}
                      sx={{ flex: 1, fontSize: 12, borderColor: "#e5e7eb", color: "#8b5cf6" }}
                    >
                      Evolução
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={14} />}
                      onClick={() => openProfile(patient, "view")}
                      sx={{ flex: 1, fontSize: 12, borderColor: "#e5e7eb", color: "#10b981" }}
                    >
                      Ficha
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={14} />}
                      onClick={() => openProfile(patient, "edit")}
                      sx={{ flex: 1, fontSize: 12, borderColor: "#e5e7eb", color: "#6b7280" }}
                    >
                      Editar
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* ── DESKTOP: tabela ── */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ display: { xs: "none", md: "block" }, border: "1px solid", borderColor: "#e5e7eb", borderRadius: 1 }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Paciente</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>CPF</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Nascimento</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Acompanhamento</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#374151" }} align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 14, fontWeight: 700 }}>
                            {getInitials(patient.nome)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                            {patient.nome}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280", fontSize: 14 }}>{patient.email}</TableCell>
                      <TableCell sx={{ color: "#6b7280", fontSize: 14 }}>
                        {patient.cpf ? patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280", fontSize: 14 }}>{formatDate(patient.dataNascimento)}</TableCell>
                      <TableCell>
                        {patient.mustChangePassword ? (
                          <Chip label="Aguardando acesso" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 12 }} />
                        ) : (
                          <Chip label="Ativo" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: 12 }} />
                        )}
                      </TableCell>
                      <TableCell>{renderRiskChip(patient.id)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          <Tooltip title="Ver evolução">
                            <IconButton size="small" onClick={() => router.push(`/nutritionist/patients/${patient.id}`)} sx={{ color: "#8b5cf6" }}>
                              <BarChart2 size={17} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver ficha">
                            <IconButton size="small" onClick={() => openProfile(patient, "view")} sx={{ color: "primary.dark" }}>
                              <Eye size={17} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar ficha">
                            <IconButton size="small" onClick={() => openProfile(patient, "edit")} sx={{ color: "#6b7280" }}>
                              <Pencil size={17} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      <UserRegistrationModal
        open={isRegistrationOpen}
        creatorRole={session.role}
        onClose={() => setIsRegistrationOpen(false)}
        onCreated={handlePatientCreated}
      />

      <AppointmentFormModal
        open={scheduleForPatientId !== null}
        defaultPatientId={scheduleForPatientId ?? undefined}
        onClose={() => setScheduleForPatientId(null)}
        onSaved={() => {
          setScheduleForPatientId(null);
          refreshEngagement();
        }}
      />

      <PatientProfileModal
        open={profileModalOpen}
        patient={selectedPatient}
        initialMode={profileModalMode}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedPatient(null);
        }}
      />
    </DashboardLayout>
  );
}
