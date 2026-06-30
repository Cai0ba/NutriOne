"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getStoredToken, type Patient } from "@/lib/auth";
import { deleteMealPlan, listMealPlans, type MealPlanStatus, type MealPlanSummary } from "@/lib/diet";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { DashboardLayout } from "../dashboard/DashboardLayout";

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MealPlanStatus, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  ativo:    { label: "Ativo",    color: "#065f46", bg: "#d1fae5" },
  inativo:  { label: "Inativo",  color: "#374151", bg: "#f3f4f6" },
};

function StatusChip({ status }: { status: MealPlanStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 12 }}
    />
  );
}

// ─── Linha de plano ───────────────────────────────────────────────────────────

function PlanRow({
  plan,
  patientId,
  onDeleted,
}: {
  plan: MealPlanSummary;
  patientId: string;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEdit = () =>
    router.push(`/nutritionist/patients/${patientId}/diet/${plan._id}`);

  const handleDelete = async () => {
    const token = getStoredToken();
    if (!token) return;
    await deleteMealPlan(token, patientId, plan._id);
    toast.success(`Plano "${plan.nome}" excluído.`);
    onDeleted(plan._id);
  };

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir plano alimentar"
        description={`Tem certeza que deseja excluir o plano "${plan.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr auto", sm: "1fr 140px 140px 100px auto" },
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #f3f4f6",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: "#f9fafb" },
      }}
    >
      {/* Nome */}
      <Typography
        sx={{ fontSize: 14, fontWeight: 600, color: "#111827", cursor: "pointer", "&:hover": { color: "primary.main" } }}
        onClick={handleEdit}
      >
        {plan.nome}
      </Typography>

      {/* Datas — hidden on xs */}
      <Typography sx={{ fontSize: 13, color: "#6b7280", display: { xs: "none", sm: "block" } }}>
        {fmtDate(plan.dataInicio)}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#6b7280", display: { xs: "none", sm: "block" } }}>
        {fmtDate(plan.dataFim)}
      </Typography>

      {/* Status */}
      <Box sx={{ display: { xs: "none", sm: "flex" } }}>
        <StatusChip status={plan.status} />
      </Box>

      {/* Ações */}
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Editar plano">
          <IconButton size="small" onClick={handleEdit} sx={{ color: "#6366f1" }}>
            <Pencil size={15} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir plano">
          <IconButton
            size="small"
            onClick={() => setConfirmOpen(true)}
            sx={{ color: "#ef4444" }}
          >
            <Trash2 size={15} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type DietPlanListPageProps = { patient: Patient };

export function DietPlanListPage({ patient }: DietPlanListPageProps) {
  const router = useRouter();
  const [plans, setPlans]   = useState<MealPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const result = await listMealPlans(token, patient.id);
      setPlans(result);
    } catch {
      setError("Não foi possível carregar os planos alimentares.");
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => { load(); }, [load]);

  const handleDeleted = (id: string) =>
    setPlans((prev) => prev.filter((p) => p._id !== id));

  const backToEvolution = () =>
    router.push(`/nutritionist/patients/${patient.id}`);

  const newPlan = () =>
    router.push(`/nutritionist/patients/${patient.id}/diet/new`);

  return (
    <DashboardLayout userName={patient.email.split("@")[0]}>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: "auto" }}>
        {/* Cabeçalho */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Tooltip title="Voltar para evolução">
            <IconButton onClick={backToEvolution} sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151" }}>
              <ArrowLeft size={18} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
              Planos Alimentares
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
              {patient.nome}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={newPlan}
            sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
          >
            Novo plano
          </Button>
        </Box>

        {/* Conteúdo */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : plans.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 6, textAlign: "center" }}
          >
            <Typography sx={{ color: "#9ca3af", fontSize: 15, mb: 2 }}>
              Nenhum plano alimentar criado ainda.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={16} />}
              onClick={newPlan}
              sx={{ borderRadius: 1, boxShadow: "none" }}
            >
              Criar primeiro plano
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            {/* Cabeçalho da tabela */}
            <Box
              sx={{
                display: { xs: "none", sm: "grid" },
                gridTemplateColumns: "1fr 140px 140px 100px auto",
                gap: 2,
                px: 2,
                py: 1,
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {["Plano", "Início", "Término", "Status", ""].map((h) => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {plans.map((plan) => (
              <PlanRow
                key={plan._id}
                plan={plan}
                patientId={patient.id}
                onDeleted={handleDeleted}
              />
            ))}
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
}
