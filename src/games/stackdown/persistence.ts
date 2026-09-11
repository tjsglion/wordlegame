import {
  MAX_HINTS_PER_WORD,
  STAR_COUNT,
  TILE_COUNT,
  WORDS_PER_PUZZLE,
  type GameMode,
} from "./shared";

export const STACKDOWN_SLUG = "stackdown";
export { STAR_COUNT };

/** Per-mode localStorage stats key, matching Wordle's `stats-${mode}` convention. */
export function stackdownStatsKey(mode: GameMode): string {
  return `stats-${mode}`;
}

/** Per-word timing row: how long the word took and how many hints it used. */
export interface StackdownWordTime {
  timeMs: number;
  hints: number;
}

export interface StackdownStats {
  wins: number;
  currentStreak: number;
  maxStreak: number;
  bestTimeMs: number | null;
  /** Date key of the last daily win, drives the streak. Local-only. */
  lastDailyWin: string | null;
  /** Wins per star count, index 0 = 1 star ... index 5 = 6 stars. */
  distribution: number[];
  /** Last local or cloud write time (epoch ms). */
  updatedAt: number;
}

export type StackdownDailyStatus = "playing" | "won";

export interface StackdownDailyState {
  dateKey: string;
  /** Picked tile ids per solved word, in solve order; solvedCount = picks.length. */
  picks: number[][];
  wordTimes: StackdownWordTime[];
  status: StackdownDailyStatus;
  elapsedMs: number;
  /** Last local or cloud write time (epoch ms). */
  updatedAt: number;
}

export interface StackdownSyncRequest {
  mode: "daily" | "practice";
  stats: StackdownStats;
  dailyState: StackdownDailyState | null;
}

export interface StackdownSyncResponse {
  authenticated: boolean;
  stats: StackdownStats | null;
  dailyState: StackdownDailyState | null;
}

export const emptyStackdownStats = (): StackdownStats => ({
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestTimeMs: null,
  lastDailyWin: null,
  distribution: Array(STAR_COUNT).fill(0),
  updatedAt: 0,
});

export function normalizeStackdownStats(
  value: Partial<StackdownStats> | null | undefined,
): StackdownStats {
  const base = emptyStackdownStats();
  const distribution = Array.from(
    { length: STAR_COUNT },
    (_, index) => Number(value?.distribution?.[index] ?? 0) || 0,
  );
  const bestTimeMs = Number(value?.bestTimeMs);

  return {
    wins: Number(value?.wins ?? base.wins) || 0,
    currentStreak: Number(value?.currentStreak ?? base.currentStreak) || 0,
    maxStreak: Number(value?.maxStreak ?? base.maxStreak) || 0,
    bestTimeMs:
      value?.bestTimeMs === null || !Number.isFinite(bestTimeMs) || bestTimeMs <= 0
        ? null
        : bestTimeMs,
    lastDailyWin:
      typeof value?.lastDailyWin === "string" ? value.lastDailyWin : null,
    distribution,
    updatedAt: Number(value?.updatedAt ?? 0) || 0,
  };
}

function normalizePicks(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, WORDS_PER_PUZZLE)
    .map((row) =>
      Array.isArray(row)
        ? row.filter(
            (id): id is number =>
              Number.isInteger(id) && id >= 0 && id < TILE_COUNT,
          )
        : [],
    );
}

function normalizeWordTimes(
  value: unknown,
  length: number,
): StackdownWordTime[] {
  const rows = Array.isArray(value) ? value : [];
  return Array.from({ length }, (_, index) => {
    const row = rows[index] as Partial<StackdownWordTime> | undefined;
    const timeMs = Number(row?.timeMs);
    const hints = Number(row?.hints);
    return {
      timeMs: Number.isFinite(timeMs) && timeMs > 0 ? timeMs : 0,
      // Hints are capped at one clue reveal per word.
      hints:
        Number.isFinite(hints) && hints > 0
          ? Math.min(Math.floor(hints), MAX_HINTS_PER_WORD)
          : 0,
    };
  });
}

export function normalizeStackdownDailyState(
  value: Partial<StackdownDailyState> | null | undefined,
): StackdownDailyState | null {
  if (!value?.dateKey || typeof value.dateKey !== "string") return null;
  const picks = normalizePicks(value.picks);
  const elapsedMs = Number(value.elapsedMs);

  return {
    dateKey: value.dateKey,
    picks,
    wordTimes: normalizeWordTimes(value.wordTimes, picks.length),
    status: value.status === "won" ? "won" : "playing",
    elapsedMs: Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0,
    updatedAt: Number(value.updatedAt ?? 0) || 0,
  };
}

function dominatesStats(left: StackdownStats, right: StackdownStats): boolean {
  return (
    left.wins >= right.wins &&
    left.currentStreak >= right.currentStreak &&
    left.maxStreak >= right.maxStreak &&
    left.distribution.every((count, index) => count >= (right.distribution[index] ?? 0))
  );
}

/** Lower is better; null (never finished) loses to any time. */
function mergeBestTimeMs(
  left: number | null,
  right: number | null,
): number | null {
  if (left === null) return right;
  if (right === null) return left;
  return Math.min(left, right);
}

export function mergeStackdownStats(
  local: Partial<StackdownStats> | null | undefined,
  remote: Partial<StackdownStats> | null | undefined,
): StackdownStats {
  const left = normalizeStackdownStats(local);
  const right = normalizeStackdownStats(remote);

  let merged: StackdownStats;
  if (dominatesStats(left, right) && !dominatesStats(right, left)) merged = left;
  else if (dominatesStats(right, left) && !dominatesStats(left, right)) merged = right;
  else merged = left.updatedAt >= right.updatedAt ? left : right;

  // bestTimeMs is monotonic (lower = better) and never stored server-side,
  // so keep the best of both sides regardless of which side won the merge.
  return {
    ...merged,
    bestTimeMs: mergeBestTimeMs(left.bestTimeMs, right.bestTimeMs),
  };
}

export function mergeStackdownDailyState(
  local: Partial<StackdownDailyState> | null | undefined,
  remote: Partial<StackdownDailyState> | null | undefined,
): StackdownDailyState | null {
  const left = normalizeStackdownDailyState(local);
  const right = normalizeStackdownDailyState(remote);

  if (!left) return right;
  if (!right) return left;
  if (left.dateKey !== right.dateKey) {
    return left.updatedAt >= right.updatedAt ? left : right;
  }
  if (left.status !== right.status) {
    return left.status === "won" ? left : right;
  }
  if (left.picks.length !== right.picks.length) {
    return left.picks.length > right.picks.length ? left : right;
  }
  return left.updatedAt >= right.updatedAt ? left : right;
}
