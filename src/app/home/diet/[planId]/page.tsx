"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MealPlanViewer } from "@/components/patient/MealPlanViewer";
import { useParams } from "next/navigation";

export default function PatientDietPlanRoute() {
  const params = useParams<{ planId: string }>();
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      {() => <MealPlanViewer planId={params.planId} />}
    </ProtectedRoute>
  );
}
