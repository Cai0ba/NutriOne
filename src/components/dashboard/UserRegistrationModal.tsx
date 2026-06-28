"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Calendar, Fingerprint, Mail, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  getStoredToken,
  registerUser,
  type Patient,
  type UserRole,
} from "@/lib/auth";
import {
  birthDateToIsoDate,
  formatBirthDate,
  formatCpf,
  isValidBirthDate,
  onlyDigits,
} from "@/lib/formatters";

const userRegistrationSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().email("Informe um email valido."),
  cpf: z
    .string()
    .refine((value) => onlyDigits(value).length === 11, "CPF deve ter 11 digitos."),
  dataNascimento: z
    .string()
    .refine(isValidBirthDate, "Informe uma data valida no formato DD/MM/AAAA."),
  role: z.enum(["client", "nutritionist"]),
});

type UserRegistrationValues = z.infer<typeof userRegistrationSchema>;

type RoleOption = {
  value: UserRole;
  label: string;
};

type UserRegistrationModalProps = {
  open: boolean;
  creatorRole: UserRole;
  onClose: () => void;
  onCreated?: (user: Patient) => void;
};

const roleLabels: Record<UserRole, string> = {
  client: "Patient",
  nutritionist: "Nutritionist",
};

export function UserRegistrationModal({
  open,
  creatorRole,
  onClose,
  onCreated,
}: UserRegistrationModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const roleOptions = useMemo<RoleOption[]>(() => {
    return [{ value: "client", label: roleLabels.client }];
  }, [creatorRole]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationValues>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      dataNascimento: "",
      role: roleOptions[0].value,
    },
  });

  useEffect(() => {
    if (roleOptions.length === 1) {
      setValue("role", roleOptions[0].value);
    }
  }, [roleOptions, setValue]);

  const handleClose = () => {
    setFormError(null);
    setSuccessMessage(null);
    reset({
      nome: "",
      email: "",
      cpf: "",
      dataNascimento: "",
      role: roleOptions[0].value,
    });
    onClose();
  };

  const onSubmit = async (values: UserRegistrationValues) => {
    setFormError(null);
    setSuccessMessage(null);

    const token = getStoredToken();

    if (!token) {
      setFormError("Sessao expirada. Faca login novamente.");
      return;
    }

    if (!roleOptions.some((option) => option.value === values.role)) {
      setFormError("Voce nao tem permissao para criar este tipo de usuario.");
      return;
    }

    try {
      const response = await registerUser(token, {
        nome: values.nome.trim(),
        email: values.email.trim(),
        cpf: onlyDigits(values.cpf),
        dataNascimento: birthDateToIsoDate(values.dataNascimento),
        role: values.role,
      });

      setSuccessMessage(
        `${roleLabels[response.user.role]} criado com senha temporaria trocar1234.`,
      );
      onCreated?.(response.user);
      reset({
        nome: "",
        email: "",
        cpf: "",
        dataNascimento: "",
        role: roleOptions[0].value,
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o usuario agora.",
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ color: "#111827", fontSize: 22, fontWeight: 850 }}>
          Add user
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 14, mt: 0.5 }}>
          The initial password will be temporary: trocar1234.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2 }}>
        <Box component="form" id="user-registration-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {formError}
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
              {successMessage}
            </Alert>
          ) : null}

          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full name"
                fullWidth
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserRound size={19} color="#6b7280" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={19} color="#6b7280" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value}
                  label="CPF"
                  placeholder="000.000.000-00"
                  fullWidth
                  error={Boolean(errors.cpf)}
                  helperText={errors.cpf?.message}
                  onChange={(event) => field.onChange(formatCpf(event.target.value))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Fingerprint size={19} color="#6b7280" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Controller
              name="dataNascimento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value}
                  label="Birth date"
                  placeholder="DD/MM/AAAA"
                  fullWidth
                  error={Boolean(errors.dataNascimento)}
                  helperText={errors.dataNascimento?.message}
                  onChange={(event) =>
                    field.onChange(formatBirthDate(event.target.value))
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={19} color="#6b7280" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Box>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.role)} sx={{ mt: 2 }}>
                <InputLabel id="user-role-label">Role</InputLabel>
                <Select
                  {...field}
                  labelId="user-role-label"
                  label="Role"
                  disabled={roleOptions.length === 1}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.role?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 1 }}>
          Close
        </Button>
        <Button
          type="submit"
          form="user-registration-form"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ borderRadius: 1, boxShadow: "none" }}
        >
          {isSubmitting ? "Creating..." : "Create user"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
