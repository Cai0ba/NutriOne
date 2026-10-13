"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { clearSession } from "@/lib/auth";
import {
  acceptConsent,
  getConsents,
  type ConsentStatus,
  type ConsentType,
} from "@/lib/consents";
import { CONSENT_TEXTS } from "./consentTexts";

type ConsentGateProps = {
  token: string;
  userId: string;
};

/** O paciente recusou um termo opcional nesta versão? (por aparelho) */
const declinedKey = (userId: string, tipo: ConsentType, versao: string) =>
  `nutrione.consent.declined.${userId}.${tipo}.${versao}`;

function wasDeclined(userId: string, c: ConsentStatus) {
  try {
    return localStorage.getItem(declinedKey(userId, c.tipo, c.versaoAtual)) === "1";
  } catch {
    return false;
  }
}

function rememberDeclined(userId: string, c: ConsentStatus) {
  try {
    localStorage.setItem(declinedKey(userId, c.tipo, c.versaoAtual), "1");
  } catch {
    // sem localStorage: só vamos perguntar de novo no próximo acesso
  }
}

/**
 * Pede os termos pendentes ao paciente. O termo obrigatório bloqueia o uso até
 * ser aceito; o opcional só é perguntado uma vez por versão em cada aparelho.
 */
export function ConsentGate({ token, userId }: ConsentGateProps) {
  const router = useRouter();
  const [pending, setPending] = useState<ConsentStatus[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getConsents(token)
      .then(({ consents }) => {
        if (cancelled) return;
        const toAsk = consents.filter((c) => {
          if (!c.pendente) return false;
          const required = CONSENT_TEXTS[c.tipo]?.obrigatorio;
          return required || !wasDeclined(userId, c);
        });
        setPending(toAsk);
      })
      // Se não der para consultar, não trava o uso: o servidor continua sem registrar o que não foi aceito.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  const requiredPending = pending.filter((c) => CONSENT_TEXTS[c.tipo].obrigatorio);
  const canContinue = requiredPending.every((c) => checked[c.tipo]);

  const handleContinue = async () => {
    setSaving(true);
    try {
      for (const c of pending) {
        if (checked[c.tipo]) await acceptConsent(token, c.tipo, c.versaoAtual);
        else rememberDeclined(userId, c);
      }
      setPending([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar sua resposta.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <Dialog open={pending.length > 0} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Antes de continuar</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 2 }}>
          Seu nutricionista usa o NutriOne para acompanhar você. Precisamos da sua autorização.
        </Typography>
        {pending.map((c) => {
          const t = CONSENT_TEXTS[c.tipo];
          return (
            <Box key={c.tipo} sx={{ mb: 1.5, p: 1.5, border: "1px solid #e5e7eb", borderRadius: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(checked[c.tipo])}
                    onChange={(e) => setChecked((prev) => ({ ...prev, [c.tipo]: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                      {t.titulo} {t.obrigatorio ? "" : "(opcional)"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 0.25 }}>{t.texto}</Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleLogout} color="inherit" sx={{ color: "#6b7280" }}>
          Sair
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue || saving}
          variant="contained"
          sx={{ borderRadius: 1, boxShadow: "none", fontWeight: 700 }}
        >
          {saving ? "Salvando..." : "Continuar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
