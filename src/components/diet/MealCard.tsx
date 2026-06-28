"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { DietFormValues } from "./DietPlanBuilder";
import { MealItemRow } from "./MealItemRow";

const EMPTY_ITEM = { alimento: "", quantidade: "", unidade: "", observacao: "" };

// Cabeçalho de colunas — só aparece quando há itens
function ColumnHeader() {
  return (
    <Box
      sx={{
        display: { xs: "none", sm: "grid" },
        gridTemplateColumns: "2.5fr 1fr 1.5fr 1fr auto",
        gap: 1,
        px: 1,
        mb: 0.5,
      }}
    >
      {["Alimento", "Qtd.", "Unidade", "Observação", ""].map((h) => (
        <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 }}>
          {h}
        </Typography>
      ))}
    </Box>
  );
}

type MealCardProps = {
  mealIndex: number;
  onRemoveMeal: () => void;
  isDragging?: boolean;
};

export function MealCard({ mealIndex, onRemoveMeal }: MealCardProps) {
  const { control, register, formState: { errors } } =
    useFormContext<DietFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `refeicoes.${mealIndex}.itens`,
  });

  const mealErrors = errors.refeicoes?.[mealIndex];

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      {/* Header da refeição */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Drag handle — visual, funcionalidade futura */}
        <Tooltip title="Reordenar (em breve)">
          <Box sx={{ color: "#d1d5db", display: "flex", cursor: "grab" }}>
            <GripVertical size={18} />
          </Box>
        </Tooltip>

        {/* Horário */}
        <Controller
          name={`refeicoes.${mealIndex}.horario`}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="time"
              size="small"
              error={Boolean(fieldState.error)}
              sx={{ width: 120 }}
              slotProps={{ input: { sx: { fontSize: 14, fontWeight: 700 } } }}
            />
          )}
        />

        {/* Nome da refeição */}
        <TextField
          {...register(`refeicoes.${mealIndex}.nome`)}
          placeholder="Ex: Café da Manhã"
          size="small"
          fullWidth
          error={Boolean(mealErrors?.nome)}
          helperText={mealErrors?.nome?.message}
          slotProps={{ input: { sx: { fontSize: 14, fontWeight: 600 } } }}
        />

        {/* Remover refeição */}
        <Tooltip title="Remover refeição">
          <IconButton
            size="small"
            onClick={onRemoveMeal}
            sx={{ color: "#ef4444", flexShrink: 0 }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Lista de itens */}
      <Box sx={{ px: 1, pt: 1.5, pb: 1 }}>
        {fields.length > 0 && <ColumnHeader />}

        {fields.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 2 }}>
            Nenhum alimento adicionado. Clique em "+ Alimento" para começar.
          </Typography>
        ) : (
          fields.map((item, itemIndex) => (
            <MealItemRow
              key={item.id}
              mealIndex={mealIndex}
              itemIndex={itemIndex}
              onRemove={() => remove(itemIndex)}
            />
          ))
        )}

        <Divider sx={{ my: 1 }} />

        <Button
          size="small"
          startIcon={<Plus size={14} />}
          onClick={() => append(EMPTY_ITEM)}
          sx={{
            fontSize: 13,
            color: "primary.dark",
            fontWeight: 700,
            textTransform: "none",
            ml: 0.5,
          }}
        >
          Alimento
        </Button>
      </Box>
    </Paper>
  );
}
