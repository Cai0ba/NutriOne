import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getStoredToken } from "@/lib/auth";
import { getSelfProfile, updateSelfPreferences } from "@/lib/patient-self";

/**
 * Preferências do paciente, compartilhadas entre as telas (layout, painel,
 * evolução). O estado é amarrado ao token da sessão: se outra pessoa entrar
 * no mesmo navegador, nada da sessão anterior é reaproveitado.
 *
 * `modoSemNumeros` é `null` enquanto carrega ou se o carregamento falhar: nos
 * dois casos as telas escondem os números. `error` diferencia "falhou" de
 * "o modo está ligado".
 */
type State = { token: string | null; value: boolean | null; error: boolean };

const EMPTY: State = { token: null, value: null, error: false };

let state: State = EMPTY;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function ensureLoaded() {
  const token = getStoredToken();
  if (!token) return;
  if (state.token === token && (state.value !== null || inflight)) return;

  state = { token, value: null, error: false };
  const request: Promise<void> = getSelfProfile(token)
    .then((profile) => {
      if (state.token === token) state = { token, value: Boolean(profile?.modoSemNumeros), error: false };
    })
    // Na dúvida, esconde os números e avisa que não foi possível carregar.
    .catch(() => {
      if (state.token === token) state = { token, value: null, error: true };
    })
    .finally(() => {
      // Só libera se ainda for esta a requisição em andamento (outra sessão pode ter começado a sua).
      if (inflight === request) inflight = null;
      emit();
    });
  inflight = request;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => (state.token === getStoredToken() ? state : EMPTY);
const getServerSnapshot = () => EMPTY;

/** Só para testes: limpa o estado compartilhado. */
export function resetPatientPreferencesStore() {
  state = EMPTY;
  inflight = null;
}

export function usePatientPreferences() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const save = useCallback(async (value: boolean) => {
    const token = getStoredToken();
    if (!token) return;
    const result = await updateSelfPreferences(token, value);
    state = { token, value: result.modoSemNumeros, error: false };
    emit();
  }, []);

  /** Tenta carregar de novo depois de uma falha. */
  const reload = useCallback(() => {
    const token = getStoredToken();
    if (!token) return;
    state = { token, value: null, error: false };
    inflight = null;
    emit();
    ensureLoaded();
  }, []);

  return {
    modoSemNumeros: snapshot.value,
    loading: snapshot.value === null && !snapshot.error,
    error: snapshot.error,
    reload,
    save,
  };
}
