"use client";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  CalendarDays,
  KeyRound,
  Leaf,
  LogOut,
  MessageCircle,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { clearSession, getStoredUser } from "@/lib/auth";
import { AccountPasswordDialog } from "@/components/auth/AccountPasswordDialog";
import { useUnreadMessages } from "@/lib/useUnreadMessages";

const DRAWER_WIDTH = 240;

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Pacientes", icon: UsersRound,    href: "/nutritionist/dashboard"    },
  { label: "Agenda",    icon: CalendarDays,  href: "/nutritionist/appointments" },
  { label: "Mensagens", icon: MessageCircle, href: "/nutritionist/messages"     },
];

function NavLink({ item, active, badge }: { item: NavItem; active: boolean; badge?: number }) {
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
      <Typography component="span" sx={{ fontSize: 15, fontWeight: "inherit", flex: 1 }}>
        {item.label}
      </Typography>
      {Boolean(badge) && (
        <Box
          sx={{
            minWidth: 20, height: 20, px: 0.5, borderRadius: 10,
            bgcolor: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {badge}
        </Box>
      )}
    </Box>
  );
}

type DashboardLayoutProps = {
  children:  ReactNode;
  userName?: string;
};

export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const user      = getStoredUser();
  const unread    = useUnreadMessages("nutritionist");
  const isMobile  = useMediaQuery("(max-width:899px)");
  const [passwordOpen, setPasswordOpen] = useState(false);

  const displayName = userName ?? user?.nome?.split(" ")[0] ?? "Nutricionista";
  const initials    = (user?.nome ?? "N")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>

      {/* ── DESKTOP: sidebar permanente ─────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
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
        <Box sx={{ height: 72, px: 3, display: "flex", alignItems: "center", gap: 1.25, borderBottom: "1px solid #f3f4f6" }}>
          <Leaf aria-hidden size={28} color="#10b981" strokeWidth={2.6} />
          <Typography sx={{ color: "#111827", fontSize: 22, fontWeight: 800 }}>NutriOne</Typography>
        </Box>

        <Stack component="nav" spacing={0.75} sx={{ px: 2, py: 2, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
              badge={item.href === "/nutritionist/messages" ? unread : undefined}
            />
          ))}
        </Stack>

        <Box sx={{ px: 2, py: 2, borderTop: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 13, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{displayName}</Typography>
              <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>Nutricionista</Typography>
            </Box>
            <Tooltip title="Alterar senha">
              <IconButton size="small" aria-label="Alterar senha" onClick={() => setPasswordOpen(true)} sx={{ color: "#9ca3af" }}>
                <KeyRound size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sair">
              <IconButton size="small" onClick={handleLogout} sx={{ color: "#9ca3af" }}>
                <LogOut size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      {/* ── DESKTOP: AppBar ─────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          display: { xs: "none", md: "flex" },
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: "background.paper",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important", px: { md: 4 }, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 14, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>{displayName}</Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ── MOBILE: AppBar superior ─────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          display: { xs: "flex", md: "none" },
          bgcolor: "background.paper",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ minHeight: "60px !important", px: 2, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Leaf aria-hidden size={24} color="#10b981" strokeWidth={2.6} />
            <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#111827" }}>NutriOne</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 13, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Tooltip title="Alterar senha">
              <IconButton size="small" aria-label="Alterar senha" onClick={() => setPasswordOpen(true)} sx={{ color: "#9ca3af" }}>
                <KeyRound size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sair">
              <IconButton size="small" onClick={handleLogout} sx={{ color: "#9ca3af" }}>
                <LogOut size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <AccountPasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />

      {/* ── Conteúdo principal ──────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          pt: { xs: "60px", md: "72px" },
          pb: { xs: "72px", md: 0 },
          minHeight: "100vh",
          bgcolor: "#f9fafb",
        }}
      >
        {children}
      </Box>

      {/* ── MOBILE: Bottom navigation bar ───────────────────────────────────── */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <BottomNavigation
            value={activeIndex === -1 ? false : activeIndex}
            sx={{ height: 64, bgcolor: "background.paper" }}
          >
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const badge = item.href === "/nutritionist/messages" ? unread : 0;
              return (
                <BottomNavigationAction
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  icon={
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <Icon size={22} strokeWidth={activeIndex === i ? 2.5 : 2} />
                      {Boolean(badge) && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -4, right: -8,
                            minWidth: 16, height: 16, px: 0.25,
                            borderRadius: 10,
                            bgcolor: "#ef4444", color: "#fff",
                            fontSize: 10, fontWeight: 800,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {badge}
                        </Box>
                      )}
                    </Box>
                  }
                  sx={{
                    color: "#9ca3af",
                    fontSize: 11,
                    "&.Mui-selected": { color: "#10b981" },
                    "& .MuiBottomNavigationAction-label": { fontSize: "11px !important" },
                  }}
                />
              );
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
