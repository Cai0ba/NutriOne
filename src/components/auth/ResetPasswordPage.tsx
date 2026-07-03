"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CheckCircle, Leaf, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha]       = useState("");
  const [confirmar, setConfirmar]       = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, novaSenha);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token inválido ou expirado. Solicite uma nova redefinição.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert severity="error" sx={{ borderRadius: 1 }}>
        Link inválido. Solicite uma nova redefinição de senha na tela de login.
      </Alert>
    );
  }

  if (success) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 64, height: 64, borderRadius: "50%",
            bgcolor: "#d1fae5", display: "flex", alignItems: "center",
            justifyContent: "center", mx: "auto", mb: 2,
          }}
        >
          <CheckCircle size={32} color="#10b981" />
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827", mb: 1 }}>
          Senha redefinida!
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 3 }}>
          Você será redirecionado para o login em instantes...
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, borderRadius: 1, fontWeight: 700 }}
        >
          Ir para o login
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
          Criar nova senha
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.75 }}>
          Escolha uma senha segura para a sua conta.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1 }}>{error}</Alert>
      )}

      <TextField
        fullWidth
        label="Nova senha"
        type="password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        required
        autoFocus
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockKeyhole size={20} color="#6b7280" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Confirmar nova senha"
        type="password"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        required
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockKeyhole size={20} color="#6b7280" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" },
          borderRadius: 1, fontWeight: 700, py: 1.45, fontSize: 16,
        }}
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </Button>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button component={Link} href="/login" variant="text" sx={{ color: "#6b7280", fontSize: 13 }}>
          Voltar para o login
        </Button>
      </Box>
    </Box>
  );
}

export function ResetPasswordPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0fdf4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 4 }}>
        <Leaf size={28} color="#10b981" strokeWidth={2.6} />
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>NutriOne</Typography>
      </Box>

      <Card
        elevation={10}
        sx={{
          width: "100%", maxWidth: 440,
          borderRadius: 1, overflow: "hidden",
          boxShadow: "0 24px 60px rgba(15,23,42,0.14)",
          px: { xs: 3, sm: 5 }, py: { xs: 4, sm: 5 },
        }}
      >
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </Box>
  );
}
