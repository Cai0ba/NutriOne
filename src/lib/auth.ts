export type UserRole = "client" | "nutritionist";

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  dataNascimento?: string;
  role: UserRole;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AuthMeResponse = {
  sub: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
  /** A API marca o token com isto enquanto a senha temporária não foi trocada. */
  mcp?: boolean;
};

export type RegisterUserPayload = {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  role: UserRole;
};

export type RegisterUserResponse = {
  user: AuthUser;
};

export type ChangePasswordPayload = {
  senhaAtual: string;
  novaSenha: string;
};

export type ChangePasswordResponse = {
  user: AuthUser;
  /** Token novo, já sem a pendência de troca de senha. */
  accessToken: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "nutriconnect.accessToken";
const USER_KEY = "nutriconnect.user";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Nao foi possivel conectar na API em ${API_URL}. Verifique se o backend esta rodando e se a URL usa http://localhost:3000 em desenvolvimento.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody = {};

    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = {};
    }

    const rawMessage = errorBody.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage ?? "Não foi possível concluir a solicitação.";

    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token: string): Promise<AuthMeResponse> {
  return request<AuthMeResponse>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function registerUser(
  token: string,
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> {
  return request<RegisterUserResponse>("/auth/register", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  token: string,
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  return request<ChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function saveSession(response: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function updateStoredToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
}

export function updateStoredUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export type Patient = {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  dataNascimento?: string;
  role: UserRole;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getMyPatients(token: string): Promise<{ patients: Patient[] }> {
  return request<{ patients: Patient[] }>("/auth/my-patients", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getDashboardPathByRole(role: UserRole) {
  if (role === "nutritionist") {
    return "/nutritionist/dashboard";
  }

  return "/home";
}

export async function forgotPassword(email: string): Promise<void> {
  await request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, novaSenha: string): Promise<void> {
  await request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha }),
  });
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
