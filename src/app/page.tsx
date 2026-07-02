import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Entrar — NutriOne",
  description:
    "Acesse a plataforma NutriOne. Nutricionistas e pacientes em um só lugar: planos alimentares, avaliações físicas, consultas e muito mais.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <LoginPage />;
}
