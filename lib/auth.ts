import { useSyncExternalStore } from "react";
import { LoginResponse } from "@/types";

const AUTH_KEY = "sports_block_user";
const LEGACY_AUTH_KEY = "user";

export function saveUser(user: LoginResponse) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(user);
  localStorage.setItem(AUTH_KEY, payload);
  localStorage.setItem(LEGACY_AUTH_KEY, payload);
  notifyUserChange();
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
  notifyUserChange();
}

// ---- React hooks for the signed-in user ----
// Components read the stored user through useSyncExternalStore instead of
// copying it into state inside a mount effect. The server render (and the
// first client render during hydration) sees null; the browser then shows
// the real user. Other tabs signing in/out are picked up via "storage".

const userListeners = new Set<() => void>();

function notifyUserChange() {
  userListeners.forEach((listener) => listener());
}

function subscribeUser(listener: () => void) {
  userListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    userListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// The snapshot must return the same object until the stored value changes.
let cachedRaw: string | null | undefined;
let cachedUser: LoginResponse | null = null;

function readUserSnapshot(): LoginResponse | null {
  const raw = localStorage.getItem(AUTH_KEY) ?? localStorage.getItem(LEGACY_AUTH_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = getUser();
  }
  return cachedUser;
}

export function useStoredUser(): LoginResponse | null {
  return useSyncExternalStore(subscribeUser, readUserSnapshot, () => null);
}

const noopSubscribe = () => () => {};

// false during the server render and hydration, true afterwards.
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
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
  return typeof user?.token === "string" ? user.token : null;
}

// Spread this into a fetch call's `headers` for any route guarded by the
// backend's `authenticate` middleware. Returns {} when logged out, so it's
// always safe to spread without an extra null check at the call site.
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Drop-in replacement for fetch that adds the sign-in header for backend calls.
// Headers the caller already set are kept; the sign-in header is added on top.
export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));
  return fetch(input, { ...init, headers });
}
