import { LoginResponse } from "@/types";

const AUTH_KEY = "sports_block_user";
const LEGACY_AUTH_KEY = "user";

export function saveUser(user: LoginResponse) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(user);
  localStorage.setItem(AUTH_KEY, payload);
  localStorage.setItem(LEGACY_AUTH_KEY, payload);
}

export function getUser(): LoginResponse | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_KEY) ?? localStorage.getItem(LEGACY_AUTH_KEY);

  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as LoginResponse;
    if (user?.id && user?.role) {
      return user;
    }
    return null;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    return null;
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
}

export function isLoggedIn() {
  return getUser() !== null;
}

export function getUserId(): number | null {
  const user = getUser();

  return user?.id ?? null;
}

export function getUserRole(): string | null {
  const user = getUser();

  return user?.role ?? null;
}

export function getAuthToken(): string | null {
  const user = getUser();
  return typeof (user as any)?.token === "string" ? (user as any).token : null;
}