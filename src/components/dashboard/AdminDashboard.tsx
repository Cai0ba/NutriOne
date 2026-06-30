"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useState } from "react";
import type { AuthMeResponse } from "@/lib/auth";
import { DashboardLayout } from "./DashboardLayout";
import { UserRegistrationModal } from "./UserRegistrationModal";

type AdminDashboardProps = {
  session: AuthMeResponse;
};

export function AdminDashboard({ session }: AdminDashboardProps) {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <DashboardLayout userName="System Admin">
      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between", mb: 4 }}
        >
          <Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ color: "#111827", fontWeight: 850, mb: 1 }}
            >
              Admin dashboard
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 16 }}>
              Manage system users and keep the platform ready for care teams.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<UserPlus size={18} />}
            onClick={() => setIsRegistrationOpen(true)}
            sx={{ borderRadius: 1, boxShadow: "none", px: 2.5, py: 1.1 }}
          >
            + Add User
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 1,
            }}
          >
            <ShieldCheck size={28} color="#10b981" />
            <Typography sx={{ mt: 2, color: "#111827", fontSize: 18, fontWeight: 850 }}>
              Protected registration
            </Typography>
            <Typography sx={{ mt: 1, color: "#6b7280" }}>
              Only admins and nutritionists can create users. New users receive the temporary password trocar1234.
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 1,
            }}
          >
            <UsersRound size={28} color="#10b981" />
            <Typography sx={{ mt: 2, color: "#111827", fontSize: 18, fontWeight: 850 }}>
              User management
            </Typography>
            <Typography sx={{ mt: 1, color: "#6b7280" }}>
              This is a temporary admin area prepared for future lists, filters and permissions management.
            </Typography>
          </Paper>
        </Stack>
      </Box>

      <UserRegistrationModal
        open={isRegistrationOpen}
        creatorRole={session.role}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </DashboardLayout>
  );
}
