/**
 * Shared open-redirect guard for the login flow: only relative paths are
 * allowed as post-auth redirect targets; anything else falls back to "/".
 * Used by both the login page (query param) and the sign-in server action
 * (form field) so the rules can never drift apart.
 */
export function resolveCallbackUrl(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") ? value : "/";
}
