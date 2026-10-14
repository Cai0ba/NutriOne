"use client";

import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { ChevronDown, KeyRound } from "lucide-react";
import { useId, useState } from "react";

type UserMenuProps = {
  initials: string;
  name: string;
  /** Só o avatar (celular): o nome ocupa espaço demais na barra pequena. */
  compact?: boolean;
  onChangePassword: () => void;
};

/**
 * Menu da conta no canto superior: avatar com o nome e uma seta, para ficar
 * claro que abre opções. Por enquanto só tem "Alterar senha".
 */
export function UserMenu({ initials, name, compact = false, onChangePassword }: UserMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const open = Boolean(anchor);
  const size = compact ? 34 : 40;

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={`Menu da conta de ${name}`}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? menuId : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          py: 0.5,
          pl: 0.5,
          pr: compact ? 0.5 : 1,
          borderRadius: 999,
          "&:hover": { bgcolor: "#f3f4f6" },
          "&.Mui-focusVisible": { outline: "2px solid #10b981", outlineOffset: 2 },
        }}
      >
        <Avatar
          sx={{ width: size, height: size, bgcolor: "#d1fae5", color: "primary.dark", fontSize: compact ? 13 : 14, fontWeight: 800 }}
        >
          {initials}
        </Avatar>
        {!compact && (
          <Typography sx={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>{name}</Typography>
        )}
        <ChevronDown
          aria-hidden
          size={compact ? 14 : 16}
          color="#6b7280"
          style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </ButtonBase>

      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(15,23,42,0.12)" } } }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onChangePassword();
          }}
        >
          <ListItemIcon>
            <KeyRound size={18} color="#374151" />
          </ListItemIcon>
          <ListItemText slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}>Alterar senha</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
