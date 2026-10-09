// Autentificare cu email + parolă (API-ul FastAPI, sesiune în cookie httpOnly).
// Înlocuiește Clerk. Toate cererile trimit cookie-ul (credentials: "include").

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-base";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  subscriptionTier: string;
  trialDaysLeft: number;
  stripeCustomerId: string | null;
  createdAt: string;
}

export const AUTH_ME_KEY = ["auth", "me"] as const;

async function authRequest<T>(path: string, body?: unknown): Promise<{ status: number; data: T | null; detail: string | null }> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return { status: res.status, data: null, detail: (json && json.detail) || null };
  }
  return { status: res.status, data: json as T, detail: null };
}

/** Aruncă eroarea din backend (în română) sau un mesaj generic. */
function unwrap<T>(result: { status: number; data: T | null; detail: string | null }): T {
  if (result.data !== null) return result.data;
  throw new Error(result.detail ?? "A apărut o eroare. Încearcă din nou.");
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return unwrap(await authRequest<AuthUser>("/auth/login", { email, password }));
}

export async function register(input: { name?: string; email: string; password: string; confirmPassword: string }): Promise<AuthUser> {
  return unwrap(await authRequest<AuthUser>("/auth/register", input));
}

export async function logout(): Promise<void> {
  await authRequest("/auth/logout", {});
}

export async function requestPasswordReset(email: string): Promise<void> {
  unwrap(await authRequest<{ success: boolean }>("/auth/forgot-password", { email }));
}

export async function resetPassword(input: { token: string; password: string; confirmPassword: string }): Promise<AuthUser> {
  return unwrap(await authRequest<AuthUser>("/auth/reset-password", input));
}

/** Utilizatorul logat, sau null dacă nu există sesiune. */
export function useCurrentUser() {
  const query = useQuery<AuthUser | null>({
    queryKey: AUTH_ME_KEY,
    queryFn: async () => {
      const result = await authRequest<AuthUser>("/users/me");
      if (result.status === 401) return null;
      return unwrap(result);
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isSignedIn: !!query.data,
  };
}

/** Pagina de login, cu adresa de întoarcere după autentificare. */
export function loginPath(next?: string): string {
  return next ? `/autentificare?next=${encodeURIComponent(next)}` : "/autentificare";
}
