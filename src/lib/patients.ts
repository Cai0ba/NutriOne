const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type PatientProfile = {
  _id?: string;
  userId: string;
  objetivo?: string;
  peso?: number;
  altura?: number;
  telefone?: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertPatientProfilePayload = Omit<
  PatientProfile,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

type ApiErrorBody = { message?: string | string[] };

async function request<TResponse>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Não foi possível conectar na API em ${API_URL}.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {}
    const raw = body.message;
    const message = Array.isArray(raw) ? raw.join(", ") : raw ?? "Erro inesperado.";
    throw new Error(message);
  }

  // 204 or empty body
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as TResponse;
}

export async function getPatientProfile(
  token: string,
  patientId: string,
): Promise<PatientProfile | null> {
  return request<PatientProfile | null>(
    `/patients/${patientId}/profile`,
    token,
  );
}

export async function upsertPatientProfile(
  token: string,
  patientId: string,
  payload: UpsertPatientProfilePayload,
): Promise<PatientProfile> {
  return request<PatientProfile>(`/patients/${patientId}/profile`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
