"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { getStoredToken } from "@/lib/auth";
import {
  getPatientProfile,
  upsertPatientProfile,
  type PatientProfile,
} from "@/lib/patients";
import type { Patient } from "@/lib/auth";

const profileSchema = z.object({
  objetivo: z.string().trim().optional(),
  peso: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v.replace(",", "."))), "Informe um número válido."),
  altura: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v.replace(",", "."))), "Informe um número válido."),
  telefone: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type Mode = "view" | "edit";

type PatientProfileModalProps = {
  open: boolean;
  patient: Patient | null;
  initialMode?: Mode;
  onClose: () => void;
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function AccordionSection({
  title,
  icon,
  defaultExpanded = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "#e5e7eb",
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
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.5 },
        }}
      >
        <Box sx={{ color: "primary.dark", display: "flex" }}>{icon}</Box>
        <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
          {title}
        </Typography>
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
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", mb: 0.4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon && <Box sx={{ color: "#9ca3af", display: "flex" }}>{icon}</Box>}
        <Typography sx={{ fontSize: 15, color: value ? "#111827" : "#d1d5db" }}>
          {value || "Não informado"}
        </Typography>
      </Box>
    </Box>
  );
}

export function PatientProfileModal({
  open,
  patient,
  initialMode = "view",
  onClose,
}: PatientProfileModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      objetivo: "",
      peso: "",
      altura: "",
      telefone: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!open || !patient) return;

    setMode(initialMode);
    setSaveError(null);
    setLoading(true);

    const token = getStoredToken();
    if (!token) { setLoading(false); return; }

    getPatientProfile(token, patient.id)
      .then((data) => {
        setProfile(data);
        if (data) {
          reset({
            objetivo: data.objetivo ?? "",
            peso: data.peso != null ? String(data.peso) : "",
            altura: data.altura != null ? String(data.altura) : "",
            telefone: data.telefone ?? "",
            observacoes: data.observacoes ?? "",
          });
        } else {
          reset({ objetivo: "", peso: "", altura: "", telefone: "", observacoes: "" });
        }
      })
      .finally(() => setLoading(false));
  }, [open, patient, reset]);

  const handleClose = () => {
    setMode("view");
    setSaveError(null);
    onClose();
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSaveError(null);
    const token = getStoredToken();
    if (!token || !patient) return;

    try {
      const toNum = (v?: string) =>
        v ? parseFloat(v.replace(",", ".")) : undefined;

      const saved = await upsertPatientProfile(token, patient.id, {
        objetivo: values.objetivo || undefined,
        peso: toNum(values.peso),
        altura: toNum(values.altura),
        telefone: values.telefone || undefined,
        observacoes: values.observacoes || undefined,
      });
      setProfile(saved);
      setMode("view");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Não foi possível salvar a ficha.",
      );
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ color: "#111827", fontSize: 20, fontWeight: 850 }}>
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
              onClick={() => setMode("edit")}
              sx={{ borderRadius: 1, fontSize: 13, textTransform: "none", fontWeight: 700 }}
            >
              Editar
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={32} color="primary" />
          </Box>
        ) : mode === "view" ? (
          <>
            {/* Accordion: Dados Pessoais */}
            <AccordionSection
              title="Dados Pessoais"
              icon={<User size={17} />}
              defaultExpanded
            >
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <ReadOnlyField label="Nome" value={patient.nome} icon={<User size={15} />} />
                <ReadOnlyField label="Nascimento" value={formatDate(patient.dataNascimento)} icon={<Calendar size={15} />} />
                <ReadOnlyField label="Email" value={patient.email} icon={<Mail size={15} />} />
                <ReadOnlyField label="Telefone" value={profile?.telefone} icon={<Phone size={15} />} />
              </Box>
            </AccordionSection>

            {/* Accordion: Dados Clínicos */}
            <AccordionSection
              title="Dados Clínicos"
              icon={<ClipboardList size={17} />}
              defaultExpanded
            >
              <ReadOnlyField label="Objetivo" value={profile?.objetivo} icon={<Target size={15} />} />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <ReadOnlyField
                  label="Peso (kg)"
                  value={profile?.peso != null ? `${profile.peso} kg` : undefined}
                  icon={<Weight size={15} />}
                />
                <ReadOnlyField
                  label="Altura (cm)"
                  value={profile?.altura != null ? `${profile.altura} cm` : undefined}
                  icon={<Ruler size={15} />}
                />
              </Box>
              <ReadOnlyField label="Observações" value={profile?.observacoes} icon={<ClipboardList size={15} />} />
            </AccordionSection>
          </>
        ) : (
          <Box component="form" id="patient-profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {saveError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                {saveError}
              </Alert>
            )}

            {/* Accordion: Dados Pessoais (apenas leitura no edit também) */}
            <AccordionSection
              title="Dados Pessoais"
              icon={<User size={17} />}
              defaultExpanded
            >
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  label="Nome"
                  value={patient.nome}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={16} color="#9ca3af" /></InputAdornment> } }}
                />
                <TextField
                  label="Nascimento"
                  value={formatDate(patient.dataNascimento)}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Calendar size={16} color="#9ca3af" /></InputAdornment> } }}
                />
                <TextField
                  label="Email"
                  value={patient.email}
                  disabled
                  fullWidth
                  size="small"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} color="#9ca3af" /></InputAdornment> } }}
                />
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      placeholder="(11) 91234-5678"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone size={16} color="#6b7280" /></InputAdornment> } }}
                    />
                  )}
                />
              </Box>
            </AccordionSection>

            {/* Accordion: Dados Clínicos */}
            <AccordionSection
              title="Dados Clínicos"
              icon={<ClipboardList size={17} />}
              defaultExpanded
            >
              <Controller
                name="objetivo"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Objetivo"
                    placeholder="Ex: Perda de peso e melhora do condicionamento"
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Target size={16} color="#6b7280" /></InputAdornment> } }}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Controller
                  name="peso"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Peso"
                      placeholder="72.5"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start"><Weight size={16} color="#6b7280" /></InputAdornment>,
                          endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>kg</Typography></InputAdornment>,
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
                      label="Altura"
                      placeholder="175"
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start"><Ruler size={16} color="#6b7280" /></InputAdornment>,
                          endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>cm</Typography></InputAdornment>,
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <Controller
                name="observacoes"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    placeholder="Ex: Paciente hipertenso, evitar exercícios intensos no início."
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </AccordionSection>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        {mode === "view" ? (
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 1 }}>
            Fechar
          </Button>
        ) : (
          <>
            <Button
              onClick={() => { setSaveError(null); setMode("view"); }}
              color="inherit"
              sx={{ borderRadius: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="patient-profile-form"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ borderRadius: 1, boxShadow: "none" }}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
