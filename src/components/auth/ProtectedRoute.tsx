"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  clearSession,
  getCurrentUser,
  getStoredToken,
  type AuthMeResponse,
} from "@/lib/auth";

type ProtectedRouteProps = {
  children: (session: AuthMeResponse) => ReactNode;
  allowedRoles?: AuthMeResponse["role"][];
  unauthorizedRedirectTo?: string;
};

export function ProtectedRoute({
  children,
  allowedRoles,
  unauthorizedRedirectTo = "/home",
}: ProtectedRouteProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthMeResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      const token = getStoredToken();

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          router.replace(unauthorizedRedirectTo);
          return;
        }

        if (isMounted) {
          setSession(currentUser);
        }
      } catch {
        clearSession();
        router.replace("/");
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, router, unauthorizedRedirectTo]);

  if (isChecking || !session) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "#f0fdf4",
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
          Validating secure session...
        </Typography>
      </Box>
    );
  }

  return children(session);
}
