"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { getStoredToken, type Patient } from "@/lib/auth";
import {
  createMealPlan,
  getMealPlan,
  updateMealPlan,
  type MealPlanDetail,
  type MealPlanStatus,
  type SaveMealPlanPayload,
} from "@/lib/diet";
import { toast } from "sonner";
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { MealCard } from "./MealCard";

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  alimento:   z.string().min(1, "Informe o alimento."),
  quantidade: z.string().min(1, "Informe a quantidade."),
  unidade:    z.string().min(1, "Informe a unidade."),
  observacao: z.string().optional(),
});

const mealSchema = z.object({
  nome:    z.string().min(1, "Informe o nome da refeição."),
  horario: z.string().min(1, "Informe o horário."),
  ordem:   z.number().optional(),
  itens:   z.array(itemSchema),
});

const planSchema = z.object({
  nome:        z.string().min(1, "Informe o nome do plano."),
  status:      z.enum(["rascunho", "ativo", "inativo"]),
  dataInicio:  z.string().optional(),
  dataFim:     z.string().optional(),
  observacoes: z.string().optional(),
  refeicoes:   z.array(mealSchema).min(1, "Adicione pelo menos uma refeição."),
});

export type DietFormValues = z.infer<typeof planSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MealPlanStatus, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  ativo:    { label: "Ativo",    color: "#065f46", bg: "#d1fae5" },
  inativo:  { label: "Inativo",  color: "#374151", bg: "#f3f4f6" },
};

const EMPTY_MEAL = {
  nome: "", horario: "08:00", ordem: 0, itens: [],
};

function planToForm(plan: MealPlanDetail): DietFormValues {
  return {
    nome:        plan.nome,
    status:      plan.status,
    dataInicio:  plan.dataInicio?.slice(0, 10) ?? "",
    dataFim:     plan.dataFim?.slice(0, 10) ?? "",
    observacoes: plan.observacoes ?? "",
    refeicoes:   plan.refeicoes.map((m) => ({
      nome:    m.nome,
      horario: m.horario,
      ordem:   m.ordem,
      itens:   m.itens.map((i) => ({
        alimento:   i.alimento,
        quantidade: i.quantidade,
        unidade:    i.unidade,
        observacao: i.observacao ?? "",
      })),
    })),
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

type DietPlanBuilderProps = {
  patient: Patient;
  planId?: string; // undefined = criação, string = edição
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function DietPlanBuilder({ patient, planId }: DietPlanBuilderProps) {
  const router  = useRouter();
  const isEdit  = Boolean(planId);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(isEdit);

  const methods = useForm<DietFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      nome: "", status: "rascunho", dataInicio: "", dataFim: "",
      observacoes: "", refeicoes: [],
    },
  });

  const { control, register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = methods;

  const { fields: meals, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: "refeicoes",
  });

  const statusVal = watch("status");
  const statusCfg = STATUS_CONFIG[statusVal];

  // Carrega plano existente para edição
  useEffect(() => {
    if (!planId) return;
    const token = getStoredToken();
    if (!token) return;

    getMealPlan(token, patient.id, planId)
      .then((plan) => { reset(planToForm(plan)); })
      .catch(() => setLoadError("Não foi possível carregar o plano alimentar."))
      .finally(() => setLoadingPlan(false));
  }, [planId, patient.id, reset]);

  const onSubmit = async (values: DietFormValues) => {
    const token = getStoredToken();
    if (!token) return;

    const payload: SaveMealPlanPayload = {
      nome:        values.nome,
      status:      values.status,
      dataInicio:  values.dataInicio  || undefined,
      dataFim:     values.dataFim     || undefined,
      observacoes: values.observacoes || undefined,
      refeicoes:   values.refeicoes.map((m, i) => ({
        nome:    m.nome,
        horario: m.horario,
        ordem:   i,
        itens:   m.itens.map((it) => ({
          alimento:   it.alimento,
          quantidade: it.quantidade,
          unidade:    it.unidade,
          observacao: it.observacao || undefined,
        })),
      })),
    };

    try {
      if (isEdit && planId) {
        await updateMealPlan(token, patient.id, planId, payload);
      } else {
        const created = await createMealPlan(token, patient.id, payload);
        // Após criar, navega para edição (URL com ID real)
        router.replace(`/nutritionist/patients/${patient.id}/diet/${created._id}`);
        return;
      }
      toast.success("Plano salvo com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar o plano.");
    }
  };

  const backToDiet = () => router.push(`/nutritionist/patients/${patient.id}/diet`);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userName={patient.email.split("@")[0]}>
      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* ── Topbar fixa ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: { xs: 2, md: 4 },
              py: 1.5,
              borderBottom: "1px solid #e5e7eb",
              bgcolor: "#fff",
              flexWrap: "wrap",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Tooltip title="Voltar para planos">
              <IconButton onClick={backToDiet} sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, color: "#374151" }}>
                <ArrowLeft size={18} />
              </IconButton>
            </Tooltip>

            {/* Nome do plano inline */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                {...register("nome")}
                placeholder="Nome do plano alimentar"
                variant="standard"
                fullWidth
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
                slotProps={{ input: { sx: { fontSize: 18, fontWeight: 800, color: "#111827" }, disableUnderline: false } }}
              />
            </Box>

            {/* Status */}
            <Select
              {...register("status")}
              value={statusVal}
              size="small"
              renderValue={() => (
                <Chip
                  label={statusCfg.label}
                  size="small"
                  sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}
                />
              )}
              sx={{ border: "none", "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            >
              {(Object.entries(STATUS_CONFIG) as [MealPlanStatus, typeof statusCfg][]).map(([val, cfg]) => (
                <MenuItem key={val} value={val}>
                  <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 12 }} />
                </MenuItem>
              ))}
            </Select>

            {/* Salvar */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
              sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </Box>

          {/* ── Conteúdo ── */}
          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
            {loadingPlan ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : loadError ? (
              <Alert severity="error">{loadError}</Alert>
            ) : (
              <>
                {errors.refeicoes?.root?.message && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                    {errors.refeicoes.root.message}
                  </Alert>
                )}

                {/* Metadados do plano */}
                <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2.5, mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1.5 }}>
                    Informações do plano
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                    <TextField
                      {...register("dataInicio")}
                      label="Data de início"
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      {...register("dataFim")}
                      label="Data de término"
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      {...register("observacoes")}
                      label="Observações gerais"
                      size="small"
                      fullWidth
                      placeholder="Ex: Evitar carboidratos simples à noite."
                    />
                  </Box>
                </Paper>

                {/* Paciente */}
                <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 2 }}>
                  Paciente: <strong style={{ color: "#111827" }}>{patient.nome}</strong>
                </Typography>

                {/* Refeições */}
                {meals.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{ border: "1px dashed #d1d5db", borderRadius: 2, p: 5, textAlign: "center", mb: 2 }}
                  >
                    <Typography sx={{ color: "#9ca3af", fontSize: 15, mb: 2 }}>
                      Nenhuma refeição adicionada. Clique em "+ Refeição" para começar.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Plus size={16} />}
                      onClick={() => appendMeal({ ...EMPTY_MEAL })}
                      sx={{ borderRadius: 1, boxShadow: "none" }}
                    >
                      + Refeição
                    </Button>
                  </Paper>
                ) : (
                  <>
                    {meals.map((meal, mealIndex) => (
                      <MealCard
                        key={meal.id}
                        mealIndex={mealIndex}
                        onRemoveMeal={() => removeMeal(mealIndex)}
                      />
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Plus size={16} />}
                      onClick={() => appendMeal({ ...EMPTY_MEAL, horario: "12:00" })}
                      sx={{ borderRadius: 1, fontWeight: 700 }}
                    >
                      + Refeição
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </FormProvider>
    </DashboardLayout>
  );
}
