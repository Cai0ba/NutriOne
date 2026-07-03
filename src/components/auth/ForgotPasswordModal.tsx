"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Mail, X } from "lucide-react";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleClose = () => {
    setEmail("");
    setSent(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
          Esqueceu a senha?
        </Typography>
        <Button onClick={handleClose} size="small" sx={{ minWidth: 0, color: "#9ca3af" }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent>
        {sent ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%",
                bgcolor: "#d1fae5", display: "flex", alignItems: "center",
                justifyContent: "center", mx: "auto", mb: 2,
              }}
            >
              <Mail size={26} color="#10b981" />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", mb: 1 }}>
              E-mail enviado!
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
              Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleClose}
              sx={{ mt: 3, bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, borderRadius: 1, fontWeight: 700 }}
            >
              Entendido
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 2.5, lineHeight: 1.6 }}>
              Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>
            )}

            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2.5 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email.trim()}
              sx={{
                bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" },
                borderRadius: 1, fontWeight: 700, py: 1.4,
              }}
            >
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
