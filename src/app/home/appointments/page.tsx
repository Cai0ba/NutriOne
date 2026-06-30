"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PatientCalendarPage } from "@/components/appointments/PatientCalendarPage";

export default function PatientAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <PatientCalendarPage />}
    </ProtectedRoute>
  );
}
