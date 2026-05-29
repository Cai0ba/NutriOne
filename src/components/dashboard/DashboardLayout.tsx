"use client";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Leaf,
  Settings,
  UsersRound,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const drawerWidth = 240;

export type DashboardMenuItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type DashboardLayoutProps = {
  children: ReactNode;
  userName?: string;
  menuItems?: DashboardMenuItem[];
};

const defaultMenuItems: DashboardMenuItem[] = [
  { label: "Patients", icon: UsersRound, active: true },
  { label: "Appointments", icon: CalendarDays },
  { label: "Analytics", icon: BarChart3 },
  { label: "Meal Plans", icon: Utensils },
  { label: "Settings", icon: Settings },
];

export function DashboardLayout({
  children,
  userName = "Dr. Sarah",
  menuItems = defaultMenuItems,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "#e5e7eb",
          },
        }}
      >
        <Box
          sx={{
            height: 72,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            borderBottom: "1px solid",
            borderColor: "#f3f4f6",
          }}
        >
          <Leaf aria-hidden size={28} color="#10b981" strokeWidth={2.6} />
          <Typography
            component="span"
            sx={{ color: "#111827", fontSize: 22, fontWeight: 800 }}
          >
            NutriOne
          </Typography>
        </Box>

        <Stack component="nav" spacing={0.75} sx={{ px: 2, py: 2 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Box
                key={item.label}
                sx={{
                  minHeight: 44,
                  px: 1.75,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 1,
                  color: item.active ? "primary.dark" : "#6b7280",
                  bgcolor: item.active ? "#ecfdf5" : "transparent",
                  fontWeight: item.active ? 800 : 650,
                }}
              >
                <Icon aria-hidden size={20} strokeWidth={2.2} />
                <Typography
                  component="span"
                  sx={{ fontSize: 15, fontWeight: "inherit" }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Drawer>

      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "#e5e7eb",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px !important",
            px: { xs: 3, md: 4 },
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <IconButton
            aria-label="Notifications"
            sx={{
              width: 40,
              height: 40,
              color: "#6b7280",
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 1,
            }}
          >
            <Badge color="primary" variant="dot" overlap="circular">
              <Bell size={19} />
            </Badge>
          </IconButton>

          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
              alt={userName}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#d1fae5",
                color: "primary.dark",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              DS
            </Avatar>
            <Typography
              component="span"
              sx={{ color: "#374151", fontSize: 15, fontWeight: 750 }}
            >
              {userName}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          ml: `${drawerWidth}px`,
          minHeight: "100vh",
          pt: "72px",
          bgcolor: "#f9fafb",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
