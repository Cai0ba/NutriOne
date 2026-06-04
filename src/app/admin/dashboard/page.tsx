"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import type { AuthMeResponse } from "@/lib/auth";

const allowedRoles: AuthMeResponse["role"][] = ["admin"];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {(session) => <AdminDashboard session={session} />}
    </ProtectedRoute>
  );
}
