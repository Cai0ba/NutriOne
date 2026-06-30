const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SenderRole = "nutritionist" | "client";

export type Message = {
  _id:            string;
  patientId:      string;
  nutritionistId: string;
  senderId:       string;
  senderRole:     SenderRole;
  texto:          string;
  lida:           boolean;
  createdAt:      string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Nutricionista ────────────────────────────────────────────────────────────

export function listMessages(token: string, patientId: string): Promise<Message[]> {
  return apiFetch(`${API_URL}/messages?patientId=${patientId}`, token);
}

export function sendMessageToPatient(token: string, patientId: string, texto: string): Promise<Message> {
  return apiFetch(`${API_URL}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ patientId, texto }),
  });
}

export function getUnreadCount(token: string): Promise<{ count: number }> {
  return apiFetch(`${API_URL}/messages/unread-count`, token);
}

export function markMessagesRead(token: string, patientId: string): Promise<void> {
  return apiFetch(`${API_URL}/messages/${patientId}/read`, token, { method: "PATCH" });
}

// ─── Paciente (self) ──────────────────────────────────────────────────────────

export function listSelfMessages(token: string): Promise<Message[]> {
  return apiFetch(`${API_URL}/me/messages`, token);
}

export function sendSelfMessage(token: string, texto: string): Promise<Message> {
  return apiFetch(`${API_URL}/me/messages`, token, {
    method: "POST",
    body: JSON.stringify({ texto }),
  });
}

export function getSelfUnreadCount(token: string): Promise<{ count: number }> {
  return apiFetch(`${API_URL}/me/messages/unread-count`, token);
}

export function markSelfMessagesRead(token: string): Promise<void> {
  return apiFetch(`${API_URL}/me/messages/read`, token, { method: "PATCH" });
}
