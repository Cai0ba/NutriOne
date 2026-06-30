"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NutritionistCalendarPage } from "@/components/appointments/NutritionistCalendarPage";

export default function NutritionistAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["nutritionist"]}>
      {() => <NutritionistCalendarPage />}
    </ProtectedRoute>
  );
}
