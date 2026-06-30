/**
 * Funções de API para o paciente consultar seus próprios dados.
 * Todas chamam os endpoints /me/* que exigem role: client.
 */

import type { PhysicalAssessment, PatientProfile } from "./patients";
import type { MealPlanSummary, MealPlanDetail } from "./diet";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type ApiErrorBody = { message?: string | string[] };

async function request<T>(path: string, token: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    throw new Error("Não foi possível conectar na API.", { cause: err });
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try { body = await response.json(); } catch {}
    const msg = body.message;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg ?? "Erro inesperado.");
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const getSelfProfile = (token: string) =>
  request<PatientProfile | null>("/me/profile", token);

export const listSelfAssessments = (token: string) =>
  request<PhysicalAssessment[]>("/me/assessments", token);

export const listSelfMealPlans = (token: string) =>
  request<MealPlanSummary[]>("/me/meal-plans", token);

export const getSelfMealPlan = (token: string, planId: string) =>
  request<MealPlanDetail>(`/me/meal-plans/${planId}`, token);
