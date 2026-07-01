"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { updateAssessment, type PhysicalAssessment } from "@/lib/patients";
import { toast } from "sonner";

// ─── Schema ───────────────────────────────────────────────────────────────────

const numStrOpt = z
  .string()
  .optional()
  .refine((v) => !v || !isNaN(parseFloat(v.replace(",", "."))), "Número inválido.");

const editSchema = z.object({
  peso:            z.string().min(1, "Informe o peso.").refine((v) => !isNaN(parseFloat(v.replace(",", "."))), "Número inválido."),
  altura:          z.string().min(1, "Informe a altura.").refine((v) => !isNaN(parseFloat(v.replace(",", "."))), "Número inválido."),
  gorduraCorporal: numStrOpt,
  massaMagra:      numStrOpt,
  circunferencia:  numStrOpt,
  observacoes:     z.string().trim().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toN(v?: string) {
  if (!v) return undefined;
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

function calcImc(p?: string, a?: string): string | null {
  const pn = parseFloat((p ?? "").replace(",", "."));
  const an = parseFloat((a ?? "").replace(",", "."));
  if (!pn || !an) return null;
  return (pn / ((an / 100) ** 2)).toFixed(1);
}

function imcClass(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso",     color: "#3b82f6" };
  if (imc < 25)   return { label: "Peso normal",        color: "#10b981" };
  if (imc < 30)   return { label: "Sobrepeso",          color: "#f59e0b" };
  if (imc < 35)   return { label: "Obesidade grau I",   color: "#f97316" };
  if (imc < 40)   return { label: "Obesidade grau II",  color: "#ef4444" };
  return                  { label: "Obesidade grau III", color: "#7f1d1d" };
}

function formatDateFull(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Props ────────────────────────────────────────────────────────────────────

type EditAssessmentModalProps = {
  open: boolean;
  assessment: PhysicalAssessment;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onUpdated: (updated: PhysicalAssessment) => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function EditAssessmentModal({
  open, assessment, patientId, patientName, onClose, onUpdated,
}: EditAssessmentModalProps) {
  const { control, handleSubmit, formState: { isSubmitting } } =
    useForm<EditFormValues>({
      resolver: zodResolver(editSchema),
      defaultValues: {
        peso:            String(assessment.peso),
        altura:          String(assessment.altura),
        gorduraCorporal: assessment.gorduraCorporal != null ? String(assessment.gorduraCorporal) : "",
        massaMagra:      assessment.massaMagra      != null ? String(assessment.massaMagra)      : "",
        circunferencia:  assessment.circunferencia  != null ? String(assessment.circunferencia)  : "",
        observacoes:     assessment.observacoes ?? "",
      },
    });

  const pesoVal   = useWatch({ control, name: "peso" });
  const alturaVal = useWatch({ control, name: "altura" });
  const imcPreview = useMemo(() => calcImc(pesoVal, alturaVal), [pesoVal, alturaVal]);
  const imcCls     = imcPreview ? imcClass(parseFloat(imcPreview)) : null;

  const onSubmit = async (values: EditFormValues) => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const updated = await updateAssessment(token, patientId, assessment._id, {
        peso:            toN(values.peso)!,
        altura:          toN(values.altura)!,
        gorduraCorporal: toN(values.gorduraCorporal),
        massaMagra:      toN(values.massaMagra),
        circunferencia:  toN(values.circunferencia),
        observacoes:     values.observacoes || undefined,
      });
      toast.success("Avaliação atualizada com sucesso!");
      onUpdated(updated);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar a avaliação.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 850, color: "#111827" }}>
          Editar Avaliação
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.3 }}>
          {patientName} · {formatDateFull(assessment.createdAt)}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1.5 }}>
        <Box component="form" id="edit-assessment-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <Controller name="peso" control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Peso *" size="small" fullWidth
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
                <TextField {...field} label="Altura *" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: {
                    startAdornment: <InputAdornment position="start"><Ruler size={16} color="#6b7280" /></InputAdornment>,
                    endAdornment:   <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>cm</Typography></InputAdornment>,
                  }}}
                />
              )}
            />
            <Box>
              <TextField
                label="IMC" value={imcPreview ?? "—"} disabled size="small" fullWidth
                slotProps={{ input: { endAdornment: imcCls ? (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: imcCls.color, whiteSpace: "nowrap" }}>
                      {imcCls.label}
                    </Typography>
                  </InputAdornment>
                ) : undefined }}}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.4 }}>
                <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>Calculado automaticamente</Typography>
                <Tooltip title="Calculado e armazenado pelo servidor." placement="top">
                  <Info size={11} color="#9ca3af" style={{ cursor: "help" }} />
                </Tooltip>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <Controller name="gorduraCorporal" control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Gordura corporal" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>%</Typography></InputAdornment> }}}
                />
              )}
            />
            <Controller name="massaMagra" control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Massa magra" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>kg</Typography></InputAdornment> }}}
                />
              )}
            />
            <Controller name="circunferencia" control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Circunferência" size="small" fullWidth
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: "#9ca3af" }}>cm</Typography></InputAdornment> }}}
                />
              )}
            />
          </Box>

          <Controller name="observacoes" control={control}
            render={({ field, fieldState }) => (
              <TextField {...field} label="Observações" size="small" fullWidth multiline rows={2}
                error={Boolean(fieldState.error)} helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 1 }}>Cancelar</Button>
        <Button
          type="submit" form="edit-assessment-form" variant="contained" color="primary"
          disabled={isSubmitting} sx={{ borderRadius: 1, boxShadow: "none" }}
        >
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
