"use client";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { BarChart3, CalendarDays, Leaf, LogOut, Salad, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession, getStoredUser } from "@/lib/auth";

const DRAWER_WIDTH = 240;

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Início",   icon: Leaf,         href: "/home"                },
  { label: "Evolução", icon: BarChart3,     href: "/home/evolution"      },
  { label: "Dieta",    icon: Salad,         href: "/home/diet"           },
  { label: "Agenda",   icon: CalendarDays,  href: "/home/appointments"   },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Box
      component={Link}
      href={item.href}
      sx={{
        minHeight: 44,
        px: 1.75,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderRadius: 1,
        textDecoration: "none",
        color: active ? "primary.dark" : "#6b7280",
        bgcolor: active ? "#ecfdf5" : "transparent",
        fontWeight: active ? 800 : 600,
        transition: "background 0.15s, color 0.15s",
        "&:hover": { bgcolor: active ? "#ecfdf5" : "#f3f4f6" },
      }}
    >
      <Icon aria-hidden size={20} strokeWidth={2.2} />
      <Typography component="span" sx={{ fontSize: 15, fontWeight: "inherit" }}>
        {item.label}
      </Typography>
    </Box>
  );
}

export function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = getStoredUser();

  const initials = (user?.nome ?? "P")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid #e5e7eb",
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            height: 72,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Leaf aria-hidden size={28} color="#10b981" strokeWidth={2.6} />
          <Typography sx={{ color: "#111827", fontSize: 22, fontWeight: 800 }}>
            NutriOne
          </Typography>
        </Box>

        {/* Nav */}
        <Stack component="nav" spacing={0.75} sx={{ px: 2, py: 2, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={
                item.href === "/home"
                  ? pathname === "/home"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </Stack>

        {/* Footer: user + logout */}
        <Box sx={{ px: 2, py: 2, borderTop: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 13, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {user?.nome ?? "Paciente"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                Minha conta
              </Typography>
            </Box>
            <Tooltip title="Sair">
              <IconButton size="small" onClick={handleLogout} sx={{ color: "#9ca3af" }}>
                <LogOut size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: "background.paper",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important", px: { xs: 3, md: 4 }, display: "flex", justifyContent: "flex-end" }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 14, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>
              {user?.nome ?? "Paciente"}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        component="main"
        sx={{ ml: `${DRAWER_WIDTH}px`, minHeight: "100vh", pt: "72px", bgcolor: "#f9fafb" }}
      >
        {children}
      </Box>
    </Box>
  );
}
