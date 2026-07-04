"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  Apple,
  Calendar,
  ChevronRight,
  ClipboardList,
  Leaf,
  MessageCircle,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

const WPP = "https://wa.me/5531996383088?text=Ol%C3%A1%2C+tenho+interesse+no+NutriOne!";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Users,
    title: "Gestão de Pacientes",
    desc: "Cadastre e acompanhe todos os seus pacientes em um só lugar. Histórico completo, perfil e evolução sempre à mão.",
    color: "#10b981",
  },
  {
    icon: Apple,
    title: "Planos Alimentares",
    desc: "Monte planos alimentares detalhados com refeições, horários e alimentos. Exporte em PDF com um clique.",
    color: "#6366f1",
  },
  {
    icon: Scale,
    title: "Avaliações Físicas",
    desc: "Registre peso, IMC, gordura corporal e massa magra. Acompanhe a evolução com gráficos claros.",
    color: "#f97316",
  },
  {
    icon: Calendar,
    title: "Consultas e Agenda",
    desc: "Organize seus agendamentos e mantenha o histórico de consultas de cada paciente organizado.",
    color: "#ec4899",
  },
  {
    icon: MessageCircle,
    title: "Mensagens",
    desc: "Canal direto entre nutricionista e paciente. Tire dúvidas, mande orientações e receba feedbacks.",
    color: "#0ea5e9",
  },
  {
    icon: TrendingUp,
    title: "Evolução Visual",
    desc: "Gráficos de progresso que mostram ao paciente o quanto ele evoluiu. Motivação com dados reais.",
    color: "#10b981",
  },
];

const steps = [
  {
    number: "1",
    title: "Entre em contato",
    desc: "Fale com a gente pelo WhatsApp. Criamos sua conta e configuramos tudo para você começar.",
  },
  {
    number: "2",
    title: "Adicione seus pacientes",
    desc: "Cadastre seus pacientes direto na plataforma. Eles recebem acesso ao próprio painel.",
  },
  {
    number: "3",
    title: "Comece a atender",
    desc: "Monte planos, registre avaliações e mantenha comunicação contínua com cada paciente.",
  },
];

const benefits = [
  "Sem limite de pacientes",
  "Exportação de planos em PDF",
  "Acesso do paciente incluso",
  "Dados seguros na nuvem",
  "Funciona no celular e computador",
  "Suporte via WhatsApp",
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function NavBar() {
  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        bgcolor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Leaf size={28} color="#10b981" strokeWidth={2.6} aria-hidden />
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
            NutriOne
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            component={Link}
            href="#funcionalidades"
            variant="text"
            sx={{ color: "#6b7280", fontWeight: 600, display: { xs: "none", sm: "inline-flex" } }}
          >
            Funcionalidades
          </Button>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            sx={{ borderRadius: 1, fontWeight: 700, borderColor: "#10b981", color: "#10b981", "&:hover": { borderColor: "#059669", bgcolor: "#f0fdf4" } }}
          >
            Entrar
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function HeroSection() {
  return (
    <Box
      sx={{
        pt: { xs: 16, md: 20 },
        pb: { xs: 10, md: 14 },
        background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#dcfce7",
            color: "#065f46",
            px: 2,
            py: 0.75,
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            mb: 3,
          }}
        >
          <ShieldCheck size={14} />
          Plataforma completa para nutricionistas
        </Box>

        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 36, sm: 48, md: 60 },
            fontWeight: 900,
            color: "#111827",
            lineHeight: 1.1,
            mb: 3,
          }}
        >
          Gerencie seus pacientes{" "}
          <Box component="span" sx={{ color: "#10b981" }}>
            com muito mais facilidade
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 17, md: 20 },
            color: "#6b7280",
            lineHeight: 1.7,
            mb: 5,
            maxWidth: 620,
            mx: "auto",
          }}
        >
          Planos alimentares, avaliações físicas, consultas e comunicação com o paciente — tudo em uma plataforma pensada para o nutricionista moderno.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            component="a"
            href={WPP}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="large"
            endIcon={<ChevronRight size={18} />}
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              borderRadius: 1.5,
              px: 4,
              py: 1.75,
              fontSize: 17,
              fontWeight: 800,
              boxShadow: "0 4px 24px rgba(16,185,129,0.35)",
            }}
          >
            Falar com a gente
          </Button>
          <Button
            component={Link}
            href="#funcionalidades"
            variant="outlined"
            size="large"
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              borderRadius: 1.5,
              px: 4,
              py: 1.75,
              fontSize: 17,
              fontWeight: 700,
              "&:hover": { borderColor: "#9ca3af", bgcolor: "transparent" },
            }}
          >
            Ver funcionalidades
          </Button>
        </Box>

        <Typography sx={{ mt: 3, fontSize: 13, color: "#9ca3af" }}>
          Acesso somente mediante convite · Entre em contato para começar
        </Typography>
      </Container>
    </Box>
  );
}

function FeaturesSection() {
  return (
    <Box
      id="funcionalidades"
      sx={{ py: { xs: 10, md: 14 }, bgcolor: "#fff", scrollMarginTop: "68px" }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 900, color: "#111827", mb: 2 }}>
            Tudo que você precisa para atender bem
          </Typography>
          <Typography sx={{ fontSize: 18, color: "#6b7280", maxWidth: 560, mx: "auto" }}>
            Desenvolvido junto com nutricionistas para resolver os problemas reais do dia a dia.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Paper
                key={f.title}
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 3.5,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${f.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Icon size={24} color={f.color} />
                </Box>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#111827", mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ fontSize: 15, color: "#6b7280", lineHeight: 1.65 }}>
                  {f.desc}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

function HowItWorksSection() {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: "#f9fafb" }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 900, color: "#111827", mb: 2 }}>
            Como funciona
          </Typography>
          <Typography sx={{ fontSize: 18, color: "#6b7280" }}>
            Simples e rápido para começar a usar hoje mesmo.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, i) => (
            <Box
              key={step.number}
              sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: i === 0 ? "#10b981" : "#e5e7eb",
                  color: i === 0 ? "#fff" : "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  flexShrink: 0,
                  mt: 0.5,
                }}
              >
                {step.number}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#111827", mb: 0.75 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ fontSize: 16, color: "#6b7280", lineHeight: 1.65 }}>
                  {step.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function BenefitsSection() {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: "#111827" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 6, md: 10 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 900, color: "#fff", mb: 2 }}>
              Tudo incluso,{" "}
              <Box component="span" sx={{ color: "#10b981" }}>
                sem surpresas
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 17, color: "#9ca3af", lineHeight: 1.7, mb: 4 }}>
              Uma plataforma completa para você focar no que importa: os seus pacientes.
            </Typography>
            <Button
              component="a"
              href={WPP}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="large"
              endIcon={<ChevronRight size={18} />}
              sx={{
                bgcolor: "#10b981",
                "&:hover": { bgcolor: "#059669" },
                borderRadius: 1.5,
                px: 4,
                py: 1.75,
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Entrar em contato
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {benefits.map((b) => (
              <Box key={b} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ClipboardList size={14} color="#fff" />
                </Box>
                <Typography sx={{ fontSize: 16, color: "#e5e7eb", fontWeight: 600 }}>
                  {b}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function CtaSection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <Leaf size={38} color="#fff" strokeWidth={2.2} />
        </Box>
        <Typography sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 900, color: "#111827", mb: 2 }}>
          Pronto para transformar seu atendimento?
        </Typography>
        <Typography sx={{ fontSize: 18, color: "#6b7280", mb: 5, lineHeight: 1.65 }}>
          Junte-se a nutricionistas que já modernizaram seu consultório com o NutriOne.
        </Typography>
        <Button
          component="a"
          href={WPP}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="large"
          endIcon={<ChevronRight size={20} />}
          sx={{
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            borderRadius: 1.5,
            px: 5,
            py: 2,
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 4px 24px rgba(16,185,129,0.35)",
          }}
        >
          Falar pelo WhatsApp
        </Button>
        <Typography sx={{ mt: 2.5, fontSize: 13, color: "#9ca3af" }}>
          Acesso somente mediante convite · Resposta rápida
        </Typography>
      </Container>
    </Box>
  );
}

function FooterSection() {
  return (
    <Box component="footer" sx={{ bgcolor: "#111827", borderTop: "1px solid #1f2937", py: 5 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Leaf size={22} color="#10b981" strokeWidth={2.6} aria-hidden />
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
              NutriOne
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            © {new Date().getFullYear()} NutriOne. Todos os direitos reservados.
          </Typography>
          <Button
            component="a"
            href={WPP}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            sx={{ color: "#9ca3af", fontSize: 13, fontWeight: 600, "&:hover": { color: "#fff" } }}
          >
            Falar pelo WhatsApp
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <Box>
      <NavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CtaSection />
      </main>
      <FooterSection />
    </Box>
  );
}
