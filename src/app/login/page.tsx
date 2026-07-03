import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse a plataforma NutriOne como nutricionista ou paciente.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LoginPage />;
}
