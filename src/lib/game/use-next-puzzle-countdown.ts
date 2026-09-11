"use client";

import { useEffect, useState } from "react";

/**
 * Live "HH:MM:SS" until the next UTC midnight — the daily puzzle rolls over
 * at UTC 00:00 (see todayKey in daily.ts), so the countdown must too.
 */
export function useNextPuzzleCountdown(active: boolean): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const nextUtcMidnight = new Date(now);
  nextUtcMidnight.setUTCHours(24, 0, 0, 0);
  const ms = Math.max(0, nextUtcMidnight.getTime() - now);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
