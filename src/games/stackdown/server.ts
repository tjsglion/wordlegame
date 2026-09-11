import "server-only";

import { todayKey } from "@/lib/game/daily";
import { generateDailyPuzzle, type GeneratedStackdownPuzzle } from "./puzzle";
import {
  WORD_LENGTH,
  WORDS_PER_PUZZLE,
  overlaps,
} from "./shared";
import {
  normalizeStackdownDailyState,
  type StackdownDailyState,
} from "./persistence";

// Tiny per-process cache: a sync POST regenerates the same daily puzzle
// twice (authoritative rebuild + answer join), so memoize by dateKey.
const DAILY_PUZZLE_CACHE_LIMIT = 4;
const dailyPuzzleCache = new Map<string, GeneratedStackdownPuzzle>();

export function getDailyPuzzle(dateKey: string): GeneratedStackdownPuzzle {
  const cached = dailyPuzzleCache.get(dateKey);
  if (cached) return cached;
  const puzzle = generateDailyPuzzle(dateKey);
  dailyPuzzleCache.set(dateKey, puzzle);
  if (dailyPuzzleCache.size > DAILY_PUZZLE_CACHE_LIMIT) {
    // Map iteration order is insertion order — drop the oldest entry.
    const oldest = dailyPuzzleCache.keys().next().value;
    if (oldest !== undefined) dailyPuzzleCache.delete(oldest);
  }
  return puzzle;
}

/** Pick ids must be an in-range array of exactly one word's length. */
export function isValidPickShape(picks: unknown, tileCount: number): picks is number[] {
  return (
    Array.isArray(picks) &&
    picks.length === WORD_LENGTH &&
    picks.every(
      (id) => Number.isInteger(id) && id >= 0 && id < tileCount,
    )
  );
}

/**
 * Replay one word's picks against the pile: every tile must still be present
 * and exposed at pick time (no remaining tile overlapping it from the layer
 * above). Verified tiles are removed from `remaining`. Returns the spelled
 * word, or null on any violation. Shape must be validated first — see
 * isValidPickShape.
 */
export function replayWordPicks(
  puzzle: GeneratedStackdownPuzzle,
  remaining: Set<number>,
  picks: number[],
): string | null {
  let word = "";
  for (const id of picks) {
    const tile = puzzle.tiles[id];
    const covered =
      !remaining.has(id) ||
      [...remaining].some(
        (other) => other !== id && overlaps(puzzle.tiles[other], tile),
      );
    if (covered) return null;
    word += tile.letter;
    remaining.delete(id);
  }
  return word;
}

// Sanity ceiling for a single word's duration (6h) — anything above is noise.
const MAX_WORD_TIME_MS = 6 * 60 * 60 * 1000;

function clampTimeMs(value: number): number {
  return Math.min(Math.max(0, Math.floor(value)), MAX_WORD_TIME_MS);
}

/**
 * Rebuild the client-claimed daily progress against the regenerated daily
 * puzzle: replay every solved word's picks in order (valid ids, still
 * present, exposed at pick time, spelling the expected word), clamp hints to
 * the per-word cap, and recompute the status from the replay. Returns null on
 * any invalid pick — tampered progress is dropped, never stored.
 */
export function buildAuthoritativeStackdownDailyState(
  value: Partial<StackdownDailyState> | null | undefined,
  dateKey = todayKey(),
): StackdownDailyState | null {
  const normalized = normalizeStackdownDailyState(value);
  if (!normalized || normalized.dateKey !== dateKey) return null;
  if (normalized.picks.length > WORDS_PER_PUZZLE) return null;

  const puzzle = getDailyPuzzle(dateKey);
  const remaining = new Set(puzzle.tiles.map((_, i) => i));
  const wordTimes: StackdownDailyState["wordTimes"] = [];

  for (let k = 0; k < normalized.picks.length; k++) {
    const picks = normalized.picks[k];
    if (!isValidPickShape(picks, puzzle.tiles.length)) return null;
    const word = replayWordPicks(puzzle, remaining, picks);
    if (word === null || word !== puzzle.words[k]) return null;
    wordTimes.push({
      timeMs: clampTimeMs(normalized.wordTimes[k]?.timeMs ?? 0),
      hints: normalized.wordTimes[k]?.hints ?? 0,
    });
  }

  // Total time must cover the per-word sums; otherwise trust the words.
  const wordTotal = wordTimes.reduce((sum, row) => sum + row.timeMs, 0);
  const elapsedMs = Math.max(clampTimeMs(normalized.elapsedMs), wordTotal);

  return {
    dateKey,
    picks: normalized.picks,
    wordTimes,
    status:
      normalized.picks.length === WORDS_PER_PUZZLE ? "won" : "playing",
    elapsedMs,
    updatedAt: normalized.updatedAt,
  };
}
