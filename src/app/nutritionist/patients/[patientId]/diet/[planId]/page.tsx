"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DietPlanBuilder } from "@/components/diet/DietPlanBuilder";
import { getMyPatients, getStoredToken, type AuthMeResponse, type Patient } from "@/lib/auth";

const allowedRoles: AuthMeResponse["role"][] = ["nutritionist"];

function PatientLoader({ patientId, planId }: { patientId: string; planId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    getMyPatients(token)
      .then((res) => {
        const found = res.patients.find((p) => p.id === patientId);
        if (found) setPatient(found);
        else setError("Paciente não encontrado ou não está vinculado ao seu perfil.");
      })
      .catch(() => setError("Não foi possível carregar os dados do paciente."));
  }, [patientId]);

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Typography sx={{ color: "#6b7280" }}>{error}</Typography>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return <DietPlanBuilder patient={patient} planId={planId} />;
}

export default function EditDietPlanRoute() {
  const params = useParams<{ patientId: string; planId: string }>();
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {() => <PatientLoader patientId={params.patientId} planId={params.planId} />}
    </ProtectedRoute>
  );
}
