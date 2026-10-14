"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  changePassword,
  updateStoredToken,
  updateStoredUser,
  type AuthUser,
} from "@/lib/auth";

const changePasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual."),
    novaSenha: z
      .string()
      .min(8, "A nova senha precisa ter pelo menos 8 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme sua nova senha."),
  })
  .refine((values) => values.novaSenha === values.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  })
  .refine((values) => values.novaSenha !== values.senhaAtual, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["novaSenha"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

type ChangePasswordModalProps = {
  open: boolean;
  token: string;
  /** Recebe o usuário atualizado e o token novo (já salvo no navegador). */
  onPasswordChanged: (user: AuthUser, accessToken: string) => void;
  /**
   * `true` (padrão): troca obrigatória da senha temporária, sem como fechar.
   * `false`: troca voluntária, com botão para cancelar.
   */
  forced?: boolean;
  onClose?: () => void;
  /** Preenche a senha atual (usado para a senha temporária enviada por e-mail ao paciente). */
  prefillCurrentPassword?: string;
};

export function ChangePasswordModal({
  open,
  token,
  onPasswordChanged,
  forced = true,
  onClose,
  prefillCurrentPassword = "",
}: ChangePasswordModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      senhaAtual: prefillCurrentPassword,
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    setFormError(null);

    try {
      const response = await changePassword(token, {
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });

      // A API devolve um token novo: o antigo continua bloqueado até a troca.
      updateStoredToken(response.accessToken);
      updateStoredUser(response.user);
      reset({ senhaAtual: prefillCurrentPassword, novaSenha: "", confirmarSenha: "" });
      onPasswordChanged(response.user, response.accessToken);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel trocar sua senha agora.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={forced ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(2px)" },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "#d1fae5",
              color: "primary.dark",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyRound size={21} />
          </Box>
          <Box>
            <Typography sx={{ color: "#111827", fontSize: 20, fontWeight: 850 }}>
              {forced ? "Troque sua senha" : "Alterar senha"}
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
              {forced
                ? "A senha temporária precisa ser substituída."
                : "Informe a senha atual e escolha uma nova."}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {formError}
            </Alert>
          ) : null}

          <Controller
            name="senhaAtual"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={forced ? "Senha temporária" : "Senha atual"}
                type="password"
                fullWidth
                error={Boolean(errors.senhaAtual)}
                helperText={errors.senhaAtual?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockKeyhole size={19} color="#6b7280" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="novaSenha"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nova senha"
                type="password"
                fullWidth
                error={Boolean(errors.novaSenha)}
                helperText={errors.novaSenha?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="confirmarSenha"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirmar nova senha"
                type="password"
                fullWidth
                error={Boolean(errors.confirmarSenha)}
                helperText={errors.confirmarSenha?.message}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3, borderRadius: 1, py: 1.2 }}
          >
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
          </Button>

          {!forced && (
            <Button
              type="button"
              fullWidth
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ mt: 1, color: "#6b7280" }}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
