"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { Trash2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import type { DietFormValues } from "./DietPlanBuilder";

type MealItemRowProps = {
  mealIndex: number;
  itemIndex: number;
  onRemove: () => void;
};

// Unidades comuns — freeSolo via datalist
const UNIDADES = [
  "g", "kg", "ml", "L",
  "unidade", "unidades",
  "colher de sopa", "colher de chá",
  "xícara", "fatia", "fatias",
  "porção", "porções",
  "copo", "à vontade", "a gosto",
];

export function MealItemRow({ mealIndex, itemIndex, onRemove }: MealItemRowProps) {
  const { control } = useFormContext<DietFormValues>();
  const listId = `units-${mealIndex}-${itemIndex}`;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "2.5fr 1fr 1.5fr 1fr auto" },
        gap: 1,
        alignItems: "flex-start",
        py: 0.75,
        px: 1,
        borderRadius: 1,
        "&:hover": { bgcolor: "#f9fafb" },
      }}
    >
      {/* Alimento */}
      <Controller
        name={`refeicoes.${mealIndex}.itens.${itemIndex}.alimento`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            placeholder="Ex: Leite integral"
            size="small"
            fullWidth
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            slotProps={{ input: { sx: { fontSize: 14 } } }}
          />
        )}
      />

      {/* Quantidade */}
      <Controller
        name={`refeicoes.${mealIndex}.itens.${itemIndex}.quantidade`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            placeholder="200"
            size="small"
            fullWidth
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            slotProps={{ input: { sx: { fontSize: 14 } } }}
          />
        )}
      />

      {/* Unidade com sugestões via datalist */}
      <Controller
        name={`refeicoes.${mealIndex}.itens.${itemIndex}.unidade`}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <datalist id={listId}>
              {UNIDADES.map((u) => <option key={u} value={u} />)}
            </datalist>
            <TextField
              {...field}
              placeholder="ml"
              size="small"
              fullWidth
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                input: {
                  sx: { fontSize: 14 },
                  inputProps: { list: listId },
                },
              }}
            />
          </>
        )}
      />

      {/* Observação */}
      <Controller
        name={`refeicoes.${mealIndex}.itens.${itemIndex}.observacao`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            placeholder="Obs. (opcional)"
            size="small"
            fullWidth
            slotProps={{ input: { sx: { fontSize: 13 } } }}
          />
        )}
      />

      {/* Remover */}
      <Tooltip title="Remover item">
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{ color: "#ef4444", mt: 0.25, flexShrink: 0 }}
        >
          <Trash2 size={15} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
