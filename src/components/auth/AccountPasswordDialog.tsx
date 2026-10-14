"use client";

import { toast } from "sonner";
import { getStoredToken } from "@/lib/auth";
import { ChangePasswordModal } from "./ChangePasswordModal";

type AccountPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** "Alterar senha" a qualquer momento, para nutricionista e paciente. */
export function AccountPasswordDialog({ open, onClose }: AccountPasswordDialogProps) {
  const token = getStoredToken();
  if (!token) return null;

  return (
    <ChangePasswordModal
      forced={false}
      open={open}
      token={token}
      onClose={onClose}
      onPasswordChanged={() => {
        toast.success("Senha alterada com sucesso.");
        onClose();
      }}
    />
  );
}
