"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PatientEvolutionView } from "@/components/patient/PatientEvolutionView";

export default function PatientEvolutionRoute() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <PatientEvolutionView />}
    </ProtectedRoute>
  );
}
