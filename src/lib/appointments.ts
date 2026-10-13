const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AppointmentType   = "consulta" | "retorno";
export type AppointmentStatus = "agendado" | "realizado" | "cancelado" | "faltou";

export type Appointment = {
  _id: string;
  patientId:      string | { _id: string; nome: string; email: string };
  nutritionistId: string;
  tipo:           AppointmentType;
  status:         AppointmentStatus;
  dataHora:       string;
  duracao:        number;
  observacoes?:   string;
  motivoCancelamento?: string;
  createdAt:      string;
};

export type CreateAppointmentPayload = {
  patientId:   string;
  tipo:        AppointmentType;
  dataHora:    string;
  duracao?:    number;
  observacoes?: string;
};

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload> & {
  status?: AppointmentStatus;
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

export function listAppointments(token: string, year: number, month: number): Promise<Appointment[]> {
  return apiFetch(`${API_URL}/appointments?year=${year}&month=${month}`, token);
}

export function createAppointment(token: string, payload: CreateAppointmentPayload): Promise<Appointment> {
  return apiFetch(`${API_URL}/appointments`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function updateAppointment(token: string, id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
  return apiFetch(`${API_URL}/appointments/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function cancelAppointmentNutritionist(token: string, id: string, motivo?: string): Promise<Appointment> {
  return apiFetch(`${API_URL}/appointments/${id}/cancel`, token, {
    method: "PATCH",
    body: JSON.stringify({ motivoCancelamento: motivo }),
  });
}

export function deleteAppointment(token: string, id: string): Promise<void> {
  return apiFetch(`${API_URL}/appointments/${id}`, token, { method: "DELETE" });
}

// ─── Paciente (self) ──────────────────────────────────────────────────────────

export function listSelfAppointments(token: string, year: number, month: number): Promise<Appointment[]> {
  return apiFetch(`${API_URL}/me/appointments?year=${year}&month=${month}`, token);
}

export function cancelSelfAppointment(token: string, id: string, motivo?: string): Promise<Appointment> {
  return apiFetch(`${API_URL}/me/appointments/${id}/cancel`, token, {
    method: "PATCH",
    body: JSON.stringify({ motivoCancelamento: motivo }),
  });
}
