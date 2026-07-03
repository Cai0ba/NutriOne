"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  getDashboardPathByRole,
  login,
  saveSession,
  type UserRole,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um email válido."),
  senha: z.string().min(1, "Informe sua senha."),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginTab = {
  label: string;
  role: UserRole;
  title: string;
  subtitle: string;
  submitLabel: string;
};

const tabs: LoginTab[] = [
  {
    label: "Paciente",
    role: "client",
    title: "Acesso do Paciente",
    subtitle: "Acesse seu plano alimentar e seu progresso",
    submitLabel: "Entrar como Paciente",
  },
  {
    label: "Nutricionista",
    role: "nutritionist",
    title: "Acesso do Nutricionista",
    subtitle: "Gerencie pacientes, planos e evolução nutricional",
    submitLabel: "Entrar como Nutricionista",
  },
];

export function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab]       = useState(0);
  const [formError, setFormError]       = useState<string | null>(null);
  const [forgotOpen, setForgotOpen]     = useState(false);
  const activeLogin = tabs[activeTab];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const response = await login({
        email: values.email,
        senha: values.senha,
      });

      if (response.user.role !== activeLogin.role) {
        const expectedRole =
          activeLogin.role === "client" ? "paciente" : "nutricionista";
        throw new Error(`Esta conta não pertence ao perfil de ${expectedRole}.`);
      }

      saveSession(response);
      router.replace(getDashboardPathByRole(response.user.role));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível fazer login agora.",
      );
    }
  };

  return (
    <>
    <Card
      component="section"
      elevation={10}
      sx={{
        width: "100%",
        maxWidth: 460,
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value: number) => {
          setActiveTab(value);
          setFormError(null);
        }}
        variant="fullWidth"
        aria-label="Perfil de acesso"
        slotProps={{ indicator: { sx: { display: "none" } } }}
        sx={{
          minHeight: 58,
          bgcolor: "#f3f4f6",
          p: 0.75,
          "& .MuiTab-root": {
            minHeight: 46,
            borderRadius: 1,
            color: "#4b5563",
            fontWeight: 800,
          },
          "& .Mui-selected": {
            bgcolor: "primary.main",
            color: "#ffffff !important",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.role} label={tab.label} disableRipple />
        ))}
      </Tabs>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ px: { xs: 3, sm: 5 }, py: { xs: 3.5, sm: 4.5 } }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            component="h1"
            sx={{ color: "text.primary", fontSize: 26, fontWeight: 800 }}
          >
            {activeLogin.title}
          </Typography>
          <Typography
            component="p"
            sx={{ color: "text.secondary", fontSize: 15, mt: 0.75 }}
          >
            {activeLogin.subtitle}
          </Typography>
        </Box>

        {formError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {formError}
          </Alert>
        ) : null}

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="E-mail"
              placeholder="E-mail"
              type="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#6b7280" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />
          )}
        />

        <Controller
          name="senha"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Senha"
              placeholder="Senha"
              type="password"
              fullWidth
              error={Boolean(errors.senha)}
              helperText={errors.senha?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockKeyhole size={20} color="#6b7280" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            my: 1.25,
          }}
        >
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label="Lembrar de mim"
                sx={{
                  mr: 0,
                  "& .MuiFormControlLabel-label": {
                    color: "text.secondary",
                    fontSize: 14,
                  },
                }}
              />
            )}
          />

          <Link
            component="button"
            type="button"
            underline="none"
            onClick={() => setForgotOpen(true)}
            sx={{ color: "primary.dark", fontSize: 14, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
          >
            Esqueceu a senha?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={isSubmitting}
          startIcon={<LogIn size={20} />}
          sx={{ mt: 1.5, py: 1.45, borderRadius: 1, fontSize: 16 }}
        >
          {isSubmitting ? "Entrando..." : activeLogin.submitLabel}
        </Button>
      </Box>
    </Card>

    <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
