const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Perfil ──────────────────────────────────────────────────────────────────

export type EatingDisorderHistory = "nao_informado" | "sem_historico" | "com_historico";

export type PatientProfile = {
  _id?: string;
  userId: string;
  objetivo?: string;
  peso?: number;
  altura?: number;
  telefone?: string;
  observacoes?: string;
  /** Só o nutricionista enxerga e altera; a API nunca devolve ao paciente. */
  historicoTranstornoAlimentar?: EatingDisorderHistory;
  /** Preferência do próprio paciente (a API rejeita se o nutricionista enviar). */
  modoSemNumeros?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertPatientProfilePayload = Omit<
  PatientProfile,
  "_id" | "userId" | "createdAt" | "updatedAt" | "modoSemNumeros"
>;

// ─── Avaliação física ─────────────────────────────────────────────────────────

export type PhysicalAssessment = {
  _id: string;
  patientId: string;
  nutritionistId: string;
  peso: number;
  altura: number;
  imc: number;
  gorduraCorporal?: number;
  massaMagra?: number;
  circunferencia?: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePhysicalAssessmentPayload = {
  peso: number;
  altura: number;
  gorduraCorporal?: number;
  massaMagra?: number;
  circunferencia?: number;
  observacoes?: string;
};

// ─── HTTP helper ──────────────────────────────────────────────────────────────

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
    throw new Error(`Não foi possível conectar na API em ${API_URL}.`, {
      cause: error,
    });
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {}
    const raw = body.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : (raw ?? "Erro inesperado.");
    throw new Error(message);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as TResponse;
}

// ─── API — Perfil ─────────────────────────────────────────────────────────────

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

// ─── API — Avaliação física ───────────────────────────────────────────────────

export async function getLatestAssessment(
  token: string,
  patientId: string,
): Promise<PhysicalAssessment | null> {
  return request<PhysicalAssessment | null>(
    `/patients/${patientId}/assessments/latest`,
    token,
  );
}

export async function createAssessment(
  token: string,
  patientId: string,
  payload: CreatePhysicalAssessmentPayload,
): Promise<PhysicalAssessment> {
  return request<PhysicalAssessment>(
    `/patients/${patientId}/assessments`,
    token,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function listAssessments(
  token: string,
  patientId: string,
): Promise<PhysicalAssessment[]> {
  return request<PhysicalAssessment[]>(
    `/patients/${patientId}/assessments`,
    token,
  );
}

export async function updateAssessment(
  token: string,
  patientId: string,
  assessmentId: string,
  payload: CreatePhysicalAssessmentPayload,
): Promise<PhysicalAssessment> {
  return request<PhysicalAssessment>(
    `/patients/${patientId}/assessments/${assessmentId}`,
    token,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}
