import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SUGGESTION_MAX_LENGTH = 1000;
const SEEN_EVENT = "suggestions:seen";

export type Suggestion = {
  id: number;
  scope: "public" | "staff";
  message: string;
  createdAt: string;
};

export type SuggestionFeed = {
  items: Suggestion[];
  lastSeenAt: string | null;
};

// YYYY-MM-DD in the viewer's local time -- what <input type="date"> speaks.
export function toDayKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey() {
  return toDayKey(new Date());
}

export function isNewSuggestion(item: Suggestion, lastSeenAt: string | null) {
  if (!lastSeenAt) return true;
  return new Date(item.createdAt).getTime() > new Date(lastSeenAt).getTime();
}

export function formatSuggestionDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatSuggestionTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export async function fetchSuggestionFeed(path: "public" | "board"): Promise<SuggestionFeed> {
  const response = await authFetch(`${API_BASE_URL}/suggestions/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load suggestions");
  const data = await response.json();
  return {
    items: Array.isArray(data.items) ? data.items : [],
    lastSeenAt: data.lastSeenAt ?? null,
  };
}

export async function postSuggestion(message: string): Promise<Suggestion> {
  const response = await authFetch(`${API_BASE_URL}/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, category: "general" }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to submit suggestion");
  }
  return response.json();
}

export async function markSuggestionsSeen() {
  try {
    await authFetch(`${API_BASE_URL}/suggestions/seen`, { method: "POST" });
  } finally {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SEEN_EVENT));
  }
}

// Live unread count for the current user's suggestion inbox.
export function useSuggestionUnread() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/suggestions/unread-count`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setCount(Number(data.count) || 0);
    } catch {
      // Offline or backend restarting: keep the last known count.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener(SEEN_EVENT, refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(SEEN_EVENT, refresh);
    };
  }, [refresh]);

  return count;
}

// ---------------------------------------------------------------- drafts
// Drafts live only in this browser, keyed by user. Nothing is sent to the
// server until the suggestion is published, which keeps posts anonymous.

export type SuggestionDraft = { id: string; message: string; updatedAt: string };

const draftKey = (userId: number | string) => `suggestion-drafts:${userId}`;

export function loadDrafts(userId: number | string): SuggestionDraft[] {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDrafts(userId: number | string, drafts: SuggestionDraft[]) {
  try {
    localStorage.setItem(draftKey(userId), JSON.stringify(drafts));
  } catch {
    // Storage full or blocked: drafts are a convenience, not critical.
  }
}
