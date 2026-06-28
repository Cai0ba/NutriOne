"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Info, Ruler, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { getStoredToken } from "@/lib/auth";
import { createAssessment, type PhysicalAssessment } from "@/lib/patients";

// ─── Schema ───────────────────────────────────────────────────────────────────

const numStr = (required?: string) =>
  required
    ? z
        .string()
        .min(1, required)
        .refine((v) => !isNaN(parseFloat(v.replace(",", "."))), "Número inválido.")
    : z
        .string()
        .optional()
        .refine(
          (v) => !v || !isNaN(parseFloat(v.replace(",", "."))),
          "Número inválido.",
        );

const schema = z.object({
  peso:              numStr("Informe o peso."),
  altura:            numStr("Informe a altura."),
  gorduraCorporal:   numStr(),
  massaMagra:        numStr(),
  circunferencia:    numStr(),
  observacoes:       z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── IMC helper ───────────────────────────────────────────────────────────────

function calcImc(peso?: string, altura?: string): string | null {
  const p = parseFloat((peso ?? "").replace(",", "."));
  const a = parseFloat((altura ?? "").replace(",", "."));
  if (!p || !a) return null;
  return (p / ((a / 100) * (a / 100))).toFixed(1);
}

function imcClass(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso",    color: "#3b82f6" };
  if (imc < 25)   return { label: "Peso normal",       color: "#10b981" };
  if (imc < 30)   return { label: "Sobrepeso",         color: "#f59e0b" };
  if (imc < 35)   return { label: "Obesidade grau I",  color: "#f97316" };
  if (imc < 40)   return { label: "Obesidade grau II", color: "#ef4444" };
  return                  { label: "Obesidade grau III",color: "#7f1d1d" };
}

function toNum(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type NewAssessmentModalProps = {
  open: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onCreated: (assessment: PhysicalAssessment) => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function NewAssessmentModal({
  open,
  patientId,
  patientName,
  onClose,
  onCreated,
}: NewAssessmentModalProps) {
  const [saveError, setSaveError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        peso: "", altura: "", gorduraCorporal: "",
        massaMagra: "", circunferencia: "", observacoes: "",
      },
    });

  const pesoVal   = useWatch({ control, name: "peso" });
  const alturaVal = useWatch({ control, name: "altura" });
  const imcPreview = useMemo(() => calcImc(pesoVal, alturaVal), [pesoVal, alturaVal]);

  const handleClose = () => {
    setSaveError(null);
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setSaveError(null);
    const token = getStoredToken();
    if (!token) return;

    try {
      const created = await createAssessment(token, patientId, {
        peso:            toNum(values.peso)!,
        altura:          toNum(values.altura)!,
        gorduraCorporal: toNum(values.gorduraCorporal),
        massaMagra:      toNum(values.massaMagra),
        circunferencia:  toNum(values.circunferencia),
        observacoes:     values.observacoes || undefined,
      });
      onCreated(created);
      handleClose();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Não foi possível salvar a avaliação.",
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 850, color: "#111827" }}>
          Nova Avaliação Física
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.3 }}>
          {patientName} · {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1.5 }}>
        <Box
          component="form"
          id="new-assessment-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {saveError}
            </Alert>
          )}

          {/* Peso + Altura + IMC */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <Controller name="peso" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field} label="Peso *" placeholder="72.5" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: {
                    startAdornment: <InputAdornment position="start"><Weight size={16} color="#6b7280" /></InputAdornment>,
                    endAdornment:   <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>kg</Typography></InputAdornment>,
                  }}}
                />
              )}
            />

            <Controller name="altura" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field} label="Altura *" placeholder="175" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: {
                    startAdornment: <InputAdornment position="start"><Ruler size={16} color="#6b7280" /></InputAdornment>,
                    endAdornment:   <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>cm</Typography></InputAdornment>,
                  }}}
                />
              )}
            />

            {/* IMC preview */}
            <Box>
              <TextField
                label="IMC" value={imcPreview ?? "—"} disabled size="small" fullWidth
                slotProps={{ input: {
                  endAdornment: imcPreview ? (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: imcClass(parseFloat(imcPreview)).color, whiteSpace: "nowrap" }}>
                        {imcClass(parseFloat(imcPreview)).label}
                      </Typography>
                    </InputAdornment>
                  ) : undefined,
                }}}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.4 }}>
                <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>Calculado automaticamente</Typography>
                <Tooltip title="O IMC é calculado e armazenado pelo servidor." placement="top">
                  <Info size={11} color="#9ca3af" style={{ cursor: "help" }} />
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Gordura + Massa magra + Circunferência */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <Controller name="gorduraCorporal" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field} label="Gordura corporal" placeholder="18.5" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>%</Typography></InputAdornment> }}}
                />
              )}
            />
            <Controller name="massaMagra" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field} label="Massa magra" placeholder="60.0" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>kg</Typography></InputAdornment> }}}
                />
              )}
            />
            <Controller name="circunferencia" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field} label="Circunferência" placeholder="82" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>cm</Typography></InputAdornment> }}}
                />
              )}
            />
          </Box>

          <Controller name="observacoes" control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field} label="Observações" size="small" fullWidth multiline rows={2}
                placeholder="Ex: Paciente em bom estado geral."
                error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 1 }}>
          Cancelar
        </Button>
        <Button
          type="submit" form="new-assessment-form" variant="contained" color="primary"
          disabled={isSubmitting} sx={{ borderRadius: 1, boxShadow: "none" }}
        >
          {isSubmitting ? "Salvando..." : "Registrar Avaliação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
