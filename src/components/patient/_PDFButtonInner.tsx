"use client";

/**
 * Componente interno carregado dinamicamente — usa PDFDownloadLink
 * que só funciona no browser.
 */
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { MealPlanDetail } from "@/lib/diet";
import { MealPlanPDF } from "./MealPlanPDF";

type Props = { plan: MealPlanDetail; patientName?: string };

export function PDFButtonInner({ plan, patientName }: Props) {
  const filename = `${plan.nome.replace(/\s+/g, "_")}_NutriOne.pdf`;

  return (
    <PDFDownloadLink
      document={<MealPlanPDF plan={plan} patientName={patientName} />}
      fileName={filename}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <Button
          variant="outlined"
          size="small"
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={14} color="inherit" />
              : <Download size={15} />
          }
          sx={{
            borderRadius:  1,
            fontWeight:    700,
            color:         "#6366f1",
            borderColor:   "#6366f1",
            "&:hover":     { borderColor: "#4f46e5", bgcolor: "#eef2ff" },
            "&:disabled":  { borderColor: "#e5e7eb" },
          }}
        >
          {loading ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
