"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NutritionistMessagesPage } from "@/components/messages/NutritionistMessagesPage";

export default function NutritionistMessagesRoute() {
  return (
    <ProtectedRoute allowedRoles={["nutritionist"]}>
      {() => <NutritionistMessagesPage />}
    </ProtectedRoute>
  );
}
