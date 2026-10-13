import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getStoredToken } from "@/lib/auth";
import { getSelfProfile, updateSelfPreferences } from "@/lib/patient-self";

/**
 * Preferências do paciente, compartilhadas entre as telas (layout, painel,
 * evolução). O estado é amarrado ao token da sessão: se outra pessoa entrar
 * no mesmo navegador, nada da sessão anterior é reaproveitado.
 *
 * `modoSemNumeros` é `null` enquanto carrega, para a tela não mostrar números
 * por um instante antes de saber a preferência.
 */
type State = { token: string | null; value: boolean | null };

let state: State = { token: null, value: null };
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function ensureLoaded() {
  const token = getStoredToken();
  if (!token) return;
  if (state.token === token && (state.value !== null || inflight)) return;

  state = { token, value: null };
  inflight = getSelfProfile(token)
    .then((profile) => {
      if (state.token === token) state = { token, value: Boolean(profile?.modoSemNumeros) };
    })
    // Na dúvida, esconde: errar para o lado de proteger é mais seguro.
    .catch(() => {
      if (state.token === token) state = { token, value: true };
    })
    .finally(() => {
      inflight = null;
      emit();
    });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => (state.token === getStoredToken() ? state.value : null);
const getServerSnapshot = () => null;

/** Só para testes: limpa o estado compartilhado. */
export function resetPatientPreferencesStore() {
  state = { token: null, value: null };
  inflight = null;
}

export function usePatientPreferences() {
  const modoSemNumeros = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const save = useCallback(async (value: boolean) => {
    const token = getStoredToken();
    if (!token) return;
    const result = await updateSelfPreferences(token, value);
    state = { token, value: result.modoSemNumeros };
    emit();
  }, []);

  return { modoSemNumeros, loading: modoSemNumeros === null, save };
}
