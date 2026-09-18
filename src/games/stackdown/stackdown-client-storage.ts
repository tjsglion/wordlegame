import { loadGameData } from "@/lib/game/storage";
import {
  emptyStackdownStats,
  normalizeStackdownStats,
  STACKDOWN_SLUG,
  stackdownStatsKey,
  type StackdownStats,
} from "./persistence";
import type { GameMode } from "./shared";

const LEGACY_STATS_KEY = "stats";

/** Loads per-mode stats and performs the one-time daily legacy fallback. */
export function loadStackdownStats(mode: GameMode): StackdownStats {
  const saved = loadGameData<StackdownStats | null>(
    STACKDOWN_SLUG,
    stackdownStatsKey(mode),
    null,
  );
  if (saved) return normalizeStackdownStats(saved);
  if (mode === "daily") {
    const legacy = loadGameData<StackdownStats | null>(
      STACKDOWN_SLUG,
      LEGACY_STATS_KEY,
      null,
    );
    if (legacy) return normalizeStackdownStats(legacy);
  }
  return emptyStackdownStats();
}
