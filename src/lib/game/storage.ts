/**
 * Client-only localStorage persistence, namespaced per game slug.
 *
 * All functions are SSR-safe: they no-op (or return the fallback) when
 * `window` is unavailable, so they can be called from components that render
 * on the server without guards at the call site.
 */

const PREFIX = "wg";

function fullKey(slug: string, key: string): string {
  return `${PREFIX}:${slug}:${key}`;
}

export function loadGameData<T>(slug: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(fullKey(slug, key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveGameData(slug: string, key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(fullKey(slug, key), JSON.stringify(value));
  } catch {
    // Storage may be full or unavailable (private mode) — progress is a
    // nice-to-have, so failing silently is acceptable here.
  }
}
