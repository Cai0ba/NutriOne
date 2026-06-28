"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MealPlanListView } from "@/components/patient/MealPlanListView";

export default function PatientDietListRoute() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <MealPlanListView />}
    </ProtectedRoute>
  );
}
