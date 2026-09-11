import { emptyStats, type GameStats } from "@/lib/game/types";
import {
  MAX_GUESSES,
  type GameMode,
  type GameStatus,
  type LetterState,
} from "./shared";

export const WORDLE_SLUG = "wordle";

export interface WordleStats extends GameStats {
  /** Wins per guess count, index 0 = won in 1 guess. */
  distribution: number[];
  /** Last local or cloud write time (epoch ms). */
  updatedAt: number;
}

export interface DailyState {
  dateKey: string;
  guesses: string[];
  results: LetterState[][];
  status: GameStatus;
  /** Revealed answer — only persisted once the round is finished. */
  answer: string | null;
  /** Last local or cloud write time (epoch ms). */
  updatedAt: number;
}

export interface WordleSyncRequest {
  mode: GameMode;
  stats: WordleStats;
  dailyState: DailyState | null;
}

export interface WordleSyncResponse {
  authenticated: boolean;
  stats: WordleStats | null;
  dailyState: DailyState | null;
}

export const emptyWordleStats = (): WordleStats => ({
  ...emptyStats,
  distribution: Array(MAX_GUESSES).fill(0),
  updatedAt: 0,
});

export function normalizeWordleStats(
  value: Partial<WordleStats> | null | undefined,
): WordleStats {
  const base = emptyWordleStats();
  const distribution = Array.from(
    { length: MAX_GUESSES },
    (_, index) => Number(value?.distribution?.[index] ?? 0) || 0,
  );

  return {
    played: Number(value?.played ?? base.played) || 0,
    wins: Number(value?.wins ?? base.wins) || 0,
    currentStreak: Number(value?.currentStreak ?? base.currentStreak) || 0,
    maxStreak: Number(value?.maxStreak ?? base.maxStreak) || 0,
    distribution,
    updatedAt: Number(value?.updatedAt ?? 0) || 0,
  };
}

export function normalizeDailyState(
  value: Partial<DailyState> | null | undefined,
): DailyState | null {
  if (!value?.dateKey || typeof value.dateKey !== "string") return null;
  const guesses = Array.isArray(value.guesses)
    ? value.guesses.filter((guess): guess is string => typeof guess === "string")
    : [];
  const results = Array.isArray(value.results)
    ? value.results.map((row) =>
        Array.isArray(row)
          ? row.filter(
              (cell): cell is LetterState =>
                cell === "correct" || cell === "present" || cell === "absent",
            )
          : [],
      )
    : [];
  const status =
    value.status === "won" || value.status === "lost" || value.status === "playing"
      ? value.status
      : "playing";

  return {
    dateKey: value.dateKey,
    guesses,
    results,
    status,
    answer: typeof value.answer === "string" ? value.answer : null,
    updatedAt: Number(value.updatedAt ?? 0) || 0,
  };
}

function dominatesStats(left: WordleStats, right: WordleStats): boolean {
  return (
    left.played >= right.played &&
    left.wins >= right.wins &&
    left.currentStreak >= right.currentStreak &&
    left.maxStreak >= right.maxStreak &&
    left.distribution.every((count, index) => count >= (right.distribution[index] ?? 0))
  );
}

function isFinished(status: GameStatus): boolean {
  return status === "won" || status === "lost";
}

export function mergeWordleStats(
  local: Partial<WordleStats> | null | undefined,
  remote: Partial<WordleStats> | null | undefined,
): WordleStats {
  const left = normalizeWordleStats(local);
  const right = normalizeWordleStats(remote);

  if (dominatesStats(left, right) && !dominatesStats(right, left)) return left;
  if (dominatesStats(right, left) && !dominatesStats(left, right)) return right;
  return left.updatedAt >= right.updatedAt ? left : right;
}

export function mergeDailyState(
  local: Partial<DailyState> | null | undefined,
  remote: Partial<DailyState> | null | undefined,
): DailyState | null {
  const left = normalizeDailyState(local);
  const right = normalizeDailyState(remote);

  if (!left) return right;
  if (!right) return left;
  if (left.dateKey !== right.dateKey) {
    return left.updatedAt >= right.updatedAt ? left : right;
  }
  if (isFinished(left.status) && !isFinished(right.status)) return left;
  if (isFinished(right.status) && !isFinished(left.status)) return right;
  if (left.guesses.length !== right.guesses.length) {
    return left.guesses.length > right.guesses.length ? left : right;
  }
  return left.updatedAt >= right.updatedAt ? left : right;
}
