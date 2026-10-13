const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type RiskLevel = "ok" | "atencao" | "alto";

export type RiskReason = {
  codigo: string;
  nivel: "atencao" | "alto";
  texto: string;
};

export type EngagementPatient = {
  patientId: string;
  nome: string;
  email: string;
  monitoramentoAtivo: boolean;
  ultimaAtividadeEm: string | null;
  proximaConsultaEm: string | null;
  nivelRisco: RiskLevel;
  motivos: RiskReason[];
};

export type EngagementResponse = {
  resumo: { total: number; alto: number; atencao: number; ok: number };
  patients: EngagementPatient[];
};

// ─── API ──────────────────────────────────────────────────────────────────────

export async function getEngagement(token: string): Promise<EngagementResponse> {
  const res = await fetch(`${API_URL}/engagement/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

// ─── Apresentação ─────────────────────────────────────────────────────────────

export const RISK_CFG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  alto:    { label: "Atenção urgente", color: "#991b1b", bg: "#fee2e2" },
  atencao: { label: "Acompanhar",      color: "#92400e", bg: "#fef3c7" },
  ok:      { label: "Em dia",          color: "#065f46", bg: "#d1fae5" },
};
