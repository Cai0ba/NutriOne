"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";

export function NutritionistDashboard() {
  return (
    <DashboardLayout userName="Dr. Sarah">
      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
        <Box sx={{ mb: 5 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ color: "#111827", fontWeight: 850, mb: 1 }}
          >
            Welcome back, Dr. Sarah!
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 16 }}>
            Manage your patients and track their progress
          </Typography>
        </Box>

        <Box
          sx={{
            minHeight: "calc(100vh - 232px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 620,
              px: { xs: 3, sm: 6 },
              py: { xs: 5, sm: 7 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#d1fae5",
                color: "primary.dark",
                borderRadius: "50%",
                mb: 3,
              }}
            >
              <UserPlus aria-hidden size={34} strokeWidth={2.1} />
            </Box>

            <Typography
              component="h2"
              variant="h5"
              sx={{ color: "#111827", fontWeight: 850, mb: 1.25 }}
            >
              No patients yet
            </Typography>

            <Typography
              sx={{
                maxWidth: 470,
                color: "#6b7280",
                fontSize: 16,
                lineHeight: 1.65,
                mb: 3.5,
              }}
            >
              Start building your practice by adding your first patient. You can
              track their progress and create personalized meal plans.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<UserPlus size={18} />}
              sx={{
                px: 2.5,
                py: 1.2,
                borderRadius: 1,
                fontSize: 15,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              + Add First Patient
            </Button>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
