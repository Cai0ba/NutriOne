"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NutritionistDashboard } from "@/components/dashboard/NutritionistDashboard";
import type { AuthMeResponse } from "@/lib/auth";

const allowedRoles: AuthMeResponse["role"][] = ["nutritionist"];

export default function NutritionistDashboardPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      unauthorizedRedirectTo="/home"
    >
      {() => <NutritionistDashboard />}
    </ProtectedRoute>
  );
}
