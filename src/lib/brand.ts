/**
 * Brand palette for non-CSS surfaces (PWA manifest, viewport theme-color).
 * Mirrors the warm-paper palette in globals.css (`--background`, `--brand`).
 *
 * src/app/icon.svg cannot import JS constants — its hex values are hardcoded
 * there and must be kept in sync with these by hand (see its header comment).
 */
export const BRAND_COLORS = {
  /** Warm-paper page background, light theme. */
  background: "#fdfbf7",
  /** Warm-charcoal page background, dark theme. */
  backgroundDark: "#2a2723",
  /** Muted teal brand accent. */
  brand: "#2e6f5e",
} as const;
