const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MealPlanStatus = "rascunho" | "ativo" | "inativo";

export type MealItem = {
  _id: string;
  alimento: string;
  quantidade: string;
  unidade: string;
  observacao?: string;
};

export type Meal = {
  _id: string;
  nome: string;
  horario: string;
  ordem: number;
  itens: MealItem[];
};

/** Lista — sem refeições (performance) */
export type MealPlanSummary = {
  _id: string;
  patientId: string;
  nutritionistId: string;
  nome: string;
  dataInicio?: string;
  dataFim?: string;
  status: MealPlanStatus;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
};

/** Detalhe — com refeições */
export type MealPlanDetail = MealPlanSummary & { refeicoes: Meal[] };

export type SaveMealItemPayload = {
  alimento: string;
  quantidade: string;
  unidade: string;
  observacao?: string;
};
export type SaveMealPayload = {
  nome: string;
  horario: string;
  ordem: number;
  itens: SaveMealItemPayload[];
};
export type SaveMealPlanPayload = {
  nome: string;
  dataInicio?: string;
  dataFim?: string;
  status?: MealPlanStatus;
  observacoes?: string;
  refeicoes: SaveMealPayload[];
};

// ─── HTTP helper ──────────────────────────────────────────────────────────────

type ApiErrorBody = { message?: string | string[] };

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
    });
  } catch (err) {
    throw new Error(`Não foi possível conectar na API.`, { cause: err });
  }

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try { body = await response.json(); } catch {}
    const msg = body.message;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg ?? "Erro inesperado.");
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// ─── API ──────────────────────────────────────────────────────────────────────

const base = (patientId: string) => `/patients/${patientId}/meal-plans`;

export const listMealPlans = (token: string, patientId: string) =>
  request<MealPlanSummary[]>(base(patientId), token);

export const getMealPlan = (token: string, patientId: string, planId: string) =>
  request<MealPlanDetail>(`${base(patientId)}/${planId}`, token);

export const createMealPlan = (token: string, patientId: string, payload: SaveMealPlanPayload) =>
  request<MealPlanDetail>(base(patientId), token, { method: "POST", body: JSON.stringify(payload) });

export const updateMealPlan = (token: string, patientId: string, planId: string, payload: SaveMealPlanPayload) =>
  request<MealPlanDetail>(`${base(patientId)}/${planId}`, token, { method: "PUT", body: JSON.stringify(payload) });

export const deleteMealPlan = (token: string, patientId: string, planId: string) =>
  request<void>(`${base(patientId)}/${planId}`, token, { method: "DELETE" });
