"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Activity, CalendarDays, LogOut, Salad } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser, type AuthMeResponse } from "@/lib/auth";

type HomeDashboardProps = {
  session: AuthMeResponse;
};

export function HomeDashboard({ session }: HomeDashboardProps) {
  const router = useRouter();
  const storedUser = getStoredUser();
  const displayName = storedUser?.nome ?? session.email;

  const handleLogout = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0fdf4" }}>
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "grey.100",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            minHeight: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Salad aria-hidden size={28} color="#16a34a" />
            <Typography sx={{ color: "text.primary", fontSize: 22, fontWeight: 800 }}>
              NutriConnect
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogOut size={18} />}
            onClick={handleLogout}
            sx={{ borderRadius: 1 }}
          >
            Sair
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" component="main" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3}>
          <Box>
            <Chip
              label={session.role === "client" ? "Patient portal" : "Nutritionist portal"}
              color="primary"
              variant="outlined"
              sx={{ mb: 1.5, fontWeight: 700 }}
            />
            <Typography
              component="h1"
              sx={{ color: "text.primary", fontSize: { xs: 30, md: 40 }, fontWeight: 850 }}
            >
              Bem-vindo, {displayName}
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1, fontSize: 17 }}>
              Esta é uma home mockada protegida. Sua sessão foi validada pela API antes de chegar aqui.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.100",
              }}
            >
              <Activity size={26} color="#16a34a" />
              <Typography sx={{ mt: 2, fontSize: 18, fontWeight: 800 }}>
                Progresso nutricional
              </Typography>
              <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
                Cards reais de evolução, metas e medidas podem entrar aqui.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.100",
              }}
            >
              <CalendarDays size={26} color="#16a34a" />
              <Typography sx={{ mt: 2, fontSize: 18, fontWeight: 800 }}>
                Próximas consultas
              </Typography>
              <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
                Agenda, lembretes e tarefas do plano ficam preparados para integração futura.
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
