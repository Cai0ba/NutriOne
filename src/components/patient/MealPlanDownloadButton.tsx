"use client";

/**
 * Botão de download do PDF do plano alimentar.
 * Carregado com dynamic({ ssr: false }) pois @react-pdf/renderer é client-only.
 */
import dynamic from "next/dynamic";
import CircularProgress from "@mui/material/CircularProgress";
import type { MealPlanDetail } from "@/lib/diet";
import { getStoredUser } from "@/lib/auth";

// ─── Loader interno (não pode ser no mesmo módulo que usa PDFDownloadLink) ────

const PDFButton = dynamic(
  () => import("./_PDFButtonInner").then((m) => m.PDFButtonInner),
  {
    ssr: false,
    loading: () => (
      <CircularProgress size={20} sx={{ color: "primary.main" }} />
    ),
  },
);

// ─── Componente público ───────────────────────────────────────────────────────

export function MealPlanDownloadButton({ plan }: { plan: MealPlanDetail }) {
  const user = getStoredUser();
  return <PDFButton plan={plan} patientName={user?.nome} />;
}
