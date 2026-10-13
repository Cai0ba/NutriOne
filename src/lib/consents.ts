const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type ConsentType = "dados_saude" | "monitoramento_atividade";

export type ConsentStatus = {
  tipo: ConsentType;
  versaoAtual: string;
  aceitaVersao: string | null;
  aceitoEm: string | null;
  pendente: boolean;
};

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.message;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : (msg ?? `Erro ${res.status}`));
  }
  return res.json();
}

export const getConsents = (token: string) =>
  request<{ consents: ConsentStatus[] }>("/me/consents", token);

export const acceptConsent = (token: string, tipo: ConsentType, versao: string) =>
  request<{ consents: ConsentStatus[] }>("/me/consents", token, {
    method: "POST",
    body: JSON.stringify({ tipo, versao }),
  });
