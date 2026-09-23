const STORAGE_KEY = "sports-block-viewed-notices";

export function getViewedNoticeIds(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.filter(
          (id): id is number => typeof id === "number"
        )
      : [];
  } catch {
    return [];
  }
}

export function markNoticesAsViewed(ids: number[]) {
  if (typeof window === "undefined" || ids.length === 0) {
    return;
  }

  const current = getViewedNoticeIds();

  const merged = Array.from(
    new Set([...current, ...ids])
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(merged)
  );

  window.dispatchEvent(
    new CustomEvent("sports-block-notices-viewed")
  );
}

export function isNoticeViewed(id: number) {
  return getViewedNoticeIds().includes(id);
}