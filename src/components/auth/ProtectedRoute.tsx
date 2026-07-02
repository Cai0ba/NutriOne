"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  clearSession,
  getCurrentUser,
  getDashboardPathByRole,
  getStoredUser,
  getStoredToken,
  updateStoredUser,
  type AuthMeResponse,
} from "@/lib/auth";
import { ChangePasswordModal } from "./ChangePasswordModal";

type ProtectedRouteProps = {
  children: (session: AuthMeResponse) => ReactNode;
  allowedRoles?: AuthMeResponse["role"][];
  unauthorizedRedirectTo?: string;
};

export function ProtectedRoute({
  children,
  allowedRoles,
  unauthorizedRedirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthMeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
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
        setToken(token);
        const currentUser = await getCurrentUser(token);
        const storedUser = getStoredUser();

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          router.replace(
            unauthorizedRedirectTo ?? getDashboardPathByRole(currentUser.role),
          );
          return;
        }

        if (isMounted) {
          setSession(currentUser);
          setMustChangePassword(
            currentUser.role === "client" &&
              Boolean(
                currentUser.mustChangePassword ??
                  storedUser?.mustChangePassword,
              ),
          );
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
          Validando sessão...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {children(session)}
      {token ? (
        <ChangePasswordModal
          open={mustChangePassword}
          token={token}
          onPasswordChanged={(user) => {
            updateStoredUser(user);
            setMustChangePassword(false);
            setSession((currentSession) =>
              currentSession
                ? {
                    ...currentSession,
                    role: user.role,
                    email: user.email,
                    mustChangePassword: user.mustChangePassword,
                  }
                : currentSession,
            );
          }}
        />
      ) : null}
    </>
  );
}
