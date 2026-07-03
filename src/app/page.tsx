import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "NutriOne — Plataforma para Nutricionistas e Pacientes",
  description:
    "Gerencie pacientes, planos alimentares, avaliações físicas e consultas em um só lugar. A plataforma completa para nutricionistas modernos. Comece grátis.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <LandingPage />;
}
