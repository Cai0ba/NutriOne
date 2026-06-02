"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <ProtectedRoute>
      {(session) => <HomeDashboard session={session} />}
    </ProtectedRoute>
  );
}
