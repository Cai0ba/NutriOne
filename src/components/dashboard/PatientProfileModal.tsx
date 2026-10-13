"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  Activity,
  Calendar,
  ChevronDown,
  ClipboardList,
  Mail,
  Pencil,
  Phone,
  Ruler,
  Target,
  User,
  Weight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Patient } from "@/lib/auth";
import { getStoredToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  createAssessment,
  getLatestAssessment,
  getPatientProfile,
  updateAssessment,
  upsertPatientProfile,
  type PhysicalAssessment,
  type EatingDisorderHistory,
  type PatientProfile,
} from "@/lib/patients";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const numStr = z
  .string()
  .optional()
  .refine(
    (v) => !v || !isNaN(parseFloat(v.replace(",", "."))),
    "Número inválido.",
  );

const HISTORY_LABELS: Record<EatingDisorderHistory, string> = {
  nao_informado: "Não informado",
  sem_historico: "Sem histórico",
  com_historico: "Com histórico",
};

const profileSchema = z.object({
  objetivo: z.string().trim().optional(),
  historicoTranstornoAlimentar: z.enum(["nao_informado", "sem_historico", "com_historico"]),
  peso: numStr,
  altura: numStr,
  telefone: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

const assessmentSchema = z.object({
  peso: z
    .string()
    .min(1, "Informe o peso.")
    .refine((v) => !isNaN(parseFloat(v.replace(",", "."))), "Número inválido."),
  altura: z
    .string()
    .min(1, "Informe a altura.")
    .refine((v) => !isNaN(parseFloat(v.replace(",", "."))), "Número inválido."),
  gorduraCorporal: numStr,
  massaMagra: numStr,
  circunferencia: numStr,
  observacoesAvaliacao: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AssessmentFormValues = z.infer<typeof assessmentSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Mode = "view" | "edit";

function toNum(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

function calcImc(peso?: string, altura?: string): string | null {
  const p = toNum(peso);
  const a = toNum(altura);
  if (!p || !a || a === 0) return null;
  const altM = a / 100;
  return (p / (altM * altM)).toFixed(1);
}

function imcClassification(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "#3b82f6" };
  if (imc < 25)   return { label: "Peso normal", color: "#10b981" };
  if (imc < 30)   return { label: "Sobrepeso", color: "#f59e0b" };
  if (imc < 35)   return { label: "Obesidade grau I", color: "#f97316" };
  if (imc < 40)   return { label: "Obesidade grau II", color: "#ef4444" };
  return           { label: "Obesidade grau III", color: "#7f1d1d" };
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function AccordionSection({
  title,
  icon,
  defaultExpanded = false,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px !important",
        mb: 1.5,
        "&:before": { display: "none" },
        "&.Mui-expanded": { mb: 1.5 },
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} color="#6b7280" />}
        sx={{
          px: 2.5,
          py: 0.5,
          minHeight: 52,
          bgcolor: "#f9fafb",
          borderRadius: "8px !important",
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
          },
        }}
      >
        <Box sx={{ color: "primary.dark", display: "flex" }}>{icon}</Box>
        <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
          {title}
        </Typography>
        {badge}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, py: 2.5 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          mb: 0.4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon && (
          <Box sx={{ color: "#9ca3af", display: "flex" }}>{icon}</Box>
        )}
        <Typography
          sx={{ fontSize: 15, color: value ? "#111827" : "#d1d5db" }}
        >
          {value || "Não informado"}
        </Typography>
      </Box>
    </Box>
  );
}

function ImcBadge({ imc }: { imc: number }) {
  const cls = imcClassification(imc);
  return (
    <Tooltip title={cls.label} placement="top">
      <Chip
        label={`IMC ${imc.toFixed(1)}`}
        size="small"
        sx={{
          bgcolor: cls.color + "22",
          color: cls.color,
          fontWeight: 700,
          fontSize: 12,
          border: `1px solid ${cls.color}44`,
        }}
      />
    </Tooltip>
  );
}

// ─── Accordion: Avaliação Física — modo view ──────────────────────────────────

function AssessmentView({ assessment }: { assessment: PhysicalAssessment | null }) {
  if (!assessment) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        Nenhuma avaliação registrada ainda.
      </Box>
    );
  }

  const cls = imcClassification(assessment.imc);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
          mb: 1,
        }}
      >
        <ReadOnlyField
          label="Peso"
          value={`${assessment.peso} kg`}
          icon={<Weight size={15} />}
        />
        <ReadOnlyField
          label="Altura"
          value={`${assessment.altura} cm`}
          icon={<Ruler size={15} />}
        />
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              mb: 0.8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            IMC
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: cls.color }}
            >
              {assessment.imc.toFixed(1)}
            </Typography>
            <Typography sx={{ fontSize: 12, color: cls.color }}>
              — {cls.label}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        <ReadOnlyField
          label="Gordura corporal"
          value={
            assessment.gorduraCorporal != null
              ? `${assessment.gorduraCorporal}%`
              : undefined
          }
        />
        <ReadOnlyField
          label="Massa magra"
          value={
            assessment.massaMagra != null
              ? `${assessment.massaMagra} kg`
              : undefined
          }
        />
        <ReadOnlyField
          label="Circunferência"
          value={
            assessment.circunferencia != null
              ? `${assessment.circunferencia} cm`
              : undefined
          }
        />
      </Box>

      {assessment.observacoes && (
        <ReadOnlyField label="Observações" value={assessment.observacoes} />
      )}

      <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 1 }}>
        Registrado em {formatDate(assessment.createdAt)}
        {assessment.createdAt !== assessment.updatedAt &&
          ` · Atualizado em ${formatDate(assessment.updatedAt)}`}
      </Typography>
    </>
  );
}

// ─── Accordion: Avaliação Física — modo edit ──────────────────────────────────

function AssessmentForm({
  control,
  errors,
}: {
  control: import("react-hook-form").Control<AssessmentFormValues>;
  errors: import("react-hook-form").FieldErrors<AssessmentFormValues>;
}) {
  const pesoVal = useWatch({ control, name: "peso" });
  const alturaVal = useWatch({ control, name: "altura" });
  const imcPreview = useMemo(
    () => calcImc(pesoVal, alturaVal),
    [pesoVal, alturaVal],
  );

  return (
    <>
      {/* Peso + Altura + IMC preview */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Controller
          name="peso"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Peso *"
              placeholder="72.5"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Weight size={16} color="#6b7280" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                        kg
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Controller
          name="altura"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Altura *"
              placeholder="175"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Ruler size={16} color="#6b7280" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                        cm
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        {/* IMC calculado em tempo real */}
        <Box>
          <TextField
            label="IMC"
            value={imcPreview ?? "—"}
            disabled
            fullWidth
            size="small"
            slotProps={{
              input: {
                endAdornment: imcPreview ? (
                  <InputAdornment position="end">
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: imcClassification(parseFloat(imcPreview)).color,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {imcClassification(parseFloat(imcPreview)).label}
                    </Typography>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
          <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.5, ml: 0.5 }}>
            Calculado automaticamente
          </Typography>
        </Box>
      </Box>

      {/* Gordura + Massa magra + Circunferência */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Controller
          name="gorduraCorporal"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Gordura corporal"
              placeholder="18.5"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                        %
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Controller
          name="massaMagra"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Massa magra"
              placeholder="60.0"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                        kg
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Controller
          name="circunferencia"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Circunferência"
              placeholder="82"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                        cm
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Box>

      <Controller
        name="observacoesAvaliacao"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Observações"
            placeholder="Ex: Paciente em bom estado geral, apresentou boa disposição."
            fullWidth
            size="small"
            multiline
            rows={2}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

type PatientProfileModalProps = {
  open: boolean;
  patient: Patient | null;
  initialMode?: Mode;
  onClose: () => void;
};

export function PatientProfileModal({
  open,
  patient,
  initialMode = "view",
  onClose,
}: PatientProfileModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [assessment, setAssessment] = useState<PhysicalAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  // Se a ficha não carregou, não deixamos salvar: o formulário vazio apagaria dados já gravados
  // (inclusive o histórico de transtorno alimentar, que controla recursos de jogo).
  const [loadFailed, setLoadFailed] = useState(false);

  // Form: ficha
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      objetivo: "",
      historicoTranstornoAlimentar: "nao_informado",
      peso: "",
      altura: "",
      telefone: "",
      observacoes: "",
    },
  });

  // Form: avaliação física
  const assessmentForm = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      peso: "",
      altura: "",
      gorduraCorporal: "",
      massaMagra: "",
      circunferencia: "",
      observacoesAvaliacao: "",
    },
  });

  // Carrega dados ao abrir
  useEffect(() => {
    if (!open || !patient) return;

    setMode(initialMode);
    setLoading(true);
    setLoadFailed(false);

    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      getPatientProfile(token, patient.id),
      getLatestAssessment(token, patient.id),
    ])
      .then(([profileData, assessmentData]) => {
        setProfile(profileData);
        setAssessment(assessmentData);

        profileForm.reset({
          objetivo: profileData?.objetivo ?? "",
          historicoTranstornoAlimentar:
            profileData?.historicoTranstornoAlimentar ?? "nao_informado",
          peso: profileData?.peso != null ? String(profileData.peso) : "",
          altura: profileData?.altura != null ? String(profileData.altura) : "",
          telefone: profileData?.telefone ?? "",
          observacoes: profileData?.observacoes ?? "",
        });

        assessmentForm.reset({
          peso: assessmentData?.peso != null ? String(assessmentData.peso) : "",
          altura:
            assessmentData?.altura != null
              ? String(assessmentData.altura)
              : "",
          gorduraCorporal:
            assessmentData?.gorduraCorporal != null
              ? String(assessmentData.gorduraCorporal)
              : "",
          massaMagra:
            assessmentData?.massaMagra != null
              ? String(assessmentData.massaMagra)
              : "",
          circunferencia:
            assessmentData?.circunferencia != null
              ? String(assessmentData.circunferencia)
              : "",
          observacoesAvaliacao: assessmentData?.observacoes ?? "",
        });
      })
      .catch(() => {
        setLoadFailed(true);
        toast.error("Não foi possível carregar a ficha do paciente. Feche e tente de novo.");
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient]);

  const handleClose = () => {
    setMode("view");
    onClose();
  };

  const handleSave = async () => {
    const token = getStoredToken();
    if (!token || !patient || loadFailed) return;

    // Dispara validação nos dois forms
    const [profileValid, assessmentValid] = await Promise.all([
      profileForm.trigger(),
      assessmentForm.trigger(),
    ]);

    if (!profileValid || !assessmentValid) return;

    const pv = profileForm.getValues();
    const av = assessmentForm.getValues();

    try {
      const [savedProfile, savedAssessment] = await Promise.all([
        upsertPatientProfile(token, patient.id, {
          objetivo: pv.objetivo || undefined,
          historicoTranstornoAlimentar: pv.historicoTranstornoAlimentar,
          peso: toNum(pv.peso),
          altura: toNum(pv.altura),
          telefone: pv.telefone || undefined,
          observacoes: pv.observacoes || undefined,
        }),
        assessment
          ? updateAssessment(token, patient.id, assessment._id, {
              peso: toNum(av.peso)!,
              altura: toNum(av.altura)!,
              gorduraCorporal: toNum(av.gorduraCorporal),
              massaMagra: toNum(av.massaMagra),
              circunferencia: toNum(av.circunferencia),
              observacoes: av.observacoesAvaliacao || undefined,
            })
          : createAssessment(token, patient.id, {
              peso: toNum(av.peso)!,
              altura: toNum(av.altura)!,
              gorduraCorporal: toNum(av.gorduraCorporal),
              massaMagra: toNum(av.massaMagra),
              circunferencia: toNum(av.circunferencia),
              observacoes: av.observacoesAvaliacao || undefined,
            }),
      ]);

      setProfile(savedProfile);
      setAssessment(savedAssessment);
      toast.success("Dados do paciente salvos com sucesso!");
      setMode("view");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados.",
      );
    }
  };

  if (!patient) return null;

  const isSaving =
    profileForm.formState.isSubmitting ||
    assessmentForm.formState.isSubmitting;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{ color: "#111827", fontSize: 20, fontWeight: 850 }}
            >
              {patient.nome}
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 13, mt: 0.3 }}>
              Ficha do paciente
            </Typography>
          </Box>
          {mode === "view" && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Pencil size={14} />}
              disabled={loading || loadFailed}
              onClick={() => setMode("edit")}
              sx={{
                borderRadius: 1,
                fontSize: 13,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Editar
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} color="primary" />
          </Box>
        ) : mode === "view" ? (
          <>
            {/* ── Dados Pessoais (view) ── */}
            <AccordionSection
              title="Dados Pessoais"
              icon={<User size={17} />}
              defaultExpanded
            >
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}
              >
                <ReadOnlyField
                  label="Nome"
                  value={patient.nome}
                  icon={<User size={15} />}
                />
                <ReadOnlyField
                  label="Nascimento"
                  value={formatDate(patient.dataNascimento)}
                  icon={<Calendar size={15} />}
                />
                <ReadOnlyField
                  label="Email"
                  value={patient.email}
                  icon={<Mail size={15} />}
                />
                <ReadOnlyField
                  label="Telefone"
                  value={profile?.telefone}
                  icon={<Phone size={15} />}
                />
              </Box>
            </AccordionSection>

            {/* ── Dados Clínicos (view) ── */}
            <AccordionSection
              title="Dados Clínicos"
              icon={<ClipboardList size={17} />}
              defaultExpanded
            >
              <ReadOnlyField
                label="Objetivo"
                value={profile?.objetivo}
                icon={<Target size={15} />}
              />
              <ReadOnlyField
                label="Histórico de transtorno alimentar"
                value={
                  HISTORY_LABELS[
                    profile?.historicoTranstornoAlimentar ?? "nao_informado"
                  ]
                }
                icon={<ClipboardList size={15} />}
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}
              >
                <ReadOnlyField
                  label="Peso referência"
                  value={
                    profile?.peso != null ? `${profile.peso} kg` : undefined
                  }
                  icon={<Weight size={15} />}
                />
                <ReadOnlyField
                  label="Altura referência"
                  value={
                    profile?.altura != null ? `${profile.altura} cm` : undefined
                  }
                  icon={<Ruler size={15} />}
                />
              </Box>
              <ReadOnlyField
                label="Observações"
                value={profile?.observacoes}
                icon={<ClipboardList size={15} />}
              />
            </AccordionSection>

            {/* ── Avaliação Física (view) ── */}
            <AccordionSection
              title="Avaliação Física"
              icon={<Activity size={17} />}
              defaultExpanded
              badge={
                assessment ? (
                  <ImcBadge imc={assessment.imc} />
                ) : undefined
              }
            >
              <AssessmentView assessment={assessment} />
            </AccordionSection>
          </>
        ) : (
          <>

            {/* ── Dados Pessoais (edit) ── */}
            <AccordionSection
              title="Dados Pessoais"
              icon={<User size={17} />}
              defaultExpanded
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Nome"
                  value={patient.nome}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} color="#9ca3af" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Nascimento"
                  value={formatDate(patient.dataNascimento)}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={16} color="#9ca3af" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Email"
                  value={patient.email}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} color="#9ca3af" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Controller
                  name="telefone"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      placeholder="(11) 91234-5678"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone size={16} color="#6b7280" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </AccordionSection>

            {/* ── Dados Clínicos (edit) ── */}
            <AccordionSection
              title="Dados Clínicos"
              icon={<ClipboardList size={17} />}
              defaultExpanded
            >
              <Controller
                name="objetivo"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Objetivo"
                    placeholder="Ex: Perda de peso e melhora do condicionamento"
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Target size={16} color="#6b7280" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name="historicoTranstornoAlimentar"
                control={profileForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Histórico de transtorno alimentar"
                    fullWidth
                    size="small"
                    helperText="Visível só para você. Recursos de jogo e metas só são liberados ao paciente marcado como “Sem histórico”."
                    sx={{ mb: 2 }}
                  >
                    {(Object.keys(HISTORY_LABELS) as EatingDisorderHistory[]).map((value) => (
                      <MenuItem key={value} value={value}>
                        {HISTORY_LABELS[value]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Controller
                  name="peso"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Peso referência"
                      placeholder="72.5"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Weight size={16} color="#6b7280" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                                kg
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="altura"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Altura referência"
                      placeholder="175"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Ruler size={16} color="#6b7280" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                                cm
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <Controller
                name="observacoes"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    placeholder="Ex: Paciente hipertenso, evitar exercícios intensos no início."
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </AccordionSection>

            {/* ── Avaliação Física (edit) ── */}
            <AccordionSection
              title="Avaliação Física"
              icon={<Activity size={17} />}
              defaultExpanded
            >
              <AssessmentForm
                control={assessmentForm.control}
                errors={assessmentForm.formState.errors}
              />
            </AccordionSection>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        {mode === "view" ? (
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ borderRadius: 1 }}
          >
            Fechar
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setMode("view");
              }}
              color="inherit"
              sx={{ borderRadius: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={isSaving}
              onClick={handleSave}
              sx={{ borderRadius: 1, boxShadow: "none" }}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
