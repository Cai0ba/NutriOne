"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PatientMessagesPage } from "@/components/messages/PatientMessagesPage";

export default function PatientMessagesRoute() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <PatientMessagesPage />}
    </ProtectedRoute>
  );
}
