"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PatientDashboard } from "@/components/patient/PatientDashboard";

export default function HomePage() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <PatientDashboard />}
    </ProtectedRoute>
  );
}
