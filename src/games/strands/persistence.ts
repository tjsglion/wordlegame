import { loadGameData, saveGameData } from "@/lib/game/storage";
import type { FoundWord, Point } from "./shared";

const SLUG = "strands";
const DAILY_GAME_KEY = "strands_daily_game";
const STATS_KEY = "strands_stats";
const PRACTICE_PREFIX = "practice_";

export interface SavedStrandsState {
  date: string;
  puzzleId?: string;
  foundWords: FoundWord[];
  hintMeter: number;
  totalHintsUsed: number;
  scoreSubmitted?: boolean;
  chargedWords?: string[];
  hintCells?: Point[];
}

type NormalizedSavedStrandsState = Required<Omit<SavedStrandsState, "puzzleId">> & Pick<SavedStrandsState, "puzzleId">;

export interface StrandsStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  perfectGames: number;
  /** Wins bucketed by hints used: [0, 1, 2, 3+]. */
  hintDistribution: [number, number, number, number];
  lastPlayedDate?: string;
  lastWonDate?: string;
}

export function normalizeSavedState(value: unknown, date: string): NormalizedSavedStrandsState | null {
  if (!isValidGameDate(date) || !isRecord(value) || value.date !== date || !Array.isArray(value.foundWords)
    || !isNonNegativeInteger(value.hintMeter) || !isNonNegativeInteger(value.totalHintsUsed)) {
    return null;
  }

  const foundWords = value.foundWords.filter(isFoundWord);
  if (foundWords.length !== value.foundWords.length) return null;

  return {
    date,
    ...(isString(value.puzzleId) ? { puzzleId: value.puzzleId } : {}),
    foundWords,
    hintMeter: Math.min(3, value.hintMeter),
    totalHintsUsed: value.totalHintsUsed,
    scoreSubmitted: value.scoreSubmitted === true,
    chargedWords: Array.isArray(value.chargedWords) ? value.chargedWords.filter(isString) : [],
    hintCells: Array.isArray(value.hintCells) ? value.hintCells.filter(isPoint) : [],
  };
}

export function loadStrandsState(date: string, puzzleId?: string): NormalizedSavedStrandsState | null {
  if (!isValidGameDate(date)) return null;
  const saved = normalizeSavedState(loadGameData<unknown>(SLUG, gameKey(date, puzzleId), null), date);
  if (saved && (!puzzleId || !saved.puzzleId || saved.puzzleId === puzzleId)) return saved;
  // Preserve existing daily progress once during the storage-key migration.
  if (puzzleId && !isPractice(date)) {
    const legacy = normalizeSavedState(loadGameData<unknown>(SLUG, gameKey(date), null), date);
    if (legacy && !legacy.puzzleId) return legacy;
  }
  if (isPractice(date)) return null;
  return normalizeSavedState(loadGameData<unknown>(SLUG, DAILY_GAME_KEY, null), date);
}

export function saveStrandsState(state: SavedStrandsState): void {
  if (!isValidGameDate(state.date)) return;
  const saved = normalizeSavedState(state, state.date);
  if (!saved) return;

  if (isPractice(saved.date)) removeOtherPracticeSaves(saved.date);
  saveGameData(SLUG, gameKey(saved.date, saved.puzzleId), saved);
  if (!isPractice(saved.date)) saveGameData(SLUG, DAILY_GAME_KEY, saved);
}

export function emptyStrandsStats(): StrandsStats {
  return { played: 0, won: 0, currentStreak: 0, maxStreak: 0, perfectGames: 0, hintDistribution: [0, 0, 0, 0] };
}

export function loadStrandsStats(): StrandsStats {
  return normalizeStats(loadGameData<unknown>(SLUG, STATS_KEY, null));
}

export function saveStrandsStats(stats: StrandsStats): void {
  saveGameData(SLUG, STATS_KEY, normalizeStats(stats));
}

export function updateStrandsStats(stats: StrandsStats, date: string, isWon: boolean, hintsUsed: number): StrandsStats {
  const current = normalizeStats(stats);
  if (!isValidGameDate(date) || isPractice(date) || current.lastPlayedDate === date) return current;

  const next: StrandsStats = { ...current, played: current.played + 1, lastPlayedDate: date };
  if (!isWon) return { ...next, currentStreak: 0 };

  const currentStreak = utcDayGap(current.lastWonDate, date) === 1 ? current.currentStreak + 1 : 1;
  const hintBucket = Math.min(hintsUsed, current.hintDistribution.length - 1);
  const hintDistribution = current.hintDistribution.map((count, index) => index === hintBucket ? count + 1 : count) as StrandsStats["hintDistribution"];
  return {
    ...next,
    won: current.won + 1,
    currentStreak,
    maxStreak: Math.max(current.maxStreak, currentStreak),
    perfectGames: current.perfectGames + (hintsUsed === 0 ? 1 : 0),
    hintDistribution,
    lastWonDate: date,
  };
}

function gameKey(date: string, puzzleId?: string) {
  return puzzleId ? `${DAILY_GAME_KEY}_${date}_${puzzleId}` : `${DAILY_GAME_KEY}_${date}`;
}

function isPractice(date: string) {
  return /^practice_\d+$/.test(date);
}

function removeOtherPracticeSaves(date: string) {
  if (typeof window === "undefined") return;
  try {
    const currentKey = `wg:${SLUG}:${gameKey(date)}`;
    const prefix = `wg:${SLUG}:${DAILY_GAME_KEY}_${PRACTICE_PREFIX}`;
    for (let index = window.localStorage.length - 1; index >= 0; index--) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix) && key !== currentKey) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage enumeration is best-effort; saveGameData handles its own failure.
  }
}

function normalizeStats(value: unknown): StrandsStats {
  if (!isRecord(value)) return emptyStrandsStats();
  return {
    played: nonNegativeInteger(value.played),
    won: nonNegativeInteger(value.won),
    currentStreak: nonNegativeInteger(value.currentStreak),
    maxStreak: nonNegativeInteger(value.maxStreak),
    perfectGames: nonNegativeInteger(value.perfectGames),
    hintDistribution: normalizeHintDistribution(value.hintDistribution),
    ...(isUtcDate(value.lastPlayedDate) ? { lastPlayedDate: value.lastPlayedDate } : {}),
    ...(isUtcDate(value.lastWonDate) ? { lastWonDate: value.lastWonDate } : {}),
  };
}

function normalizeHintDistribution(value: unknown): StrandsStats["hintDistribution"] {
  if (!Array.isArray(value)) return [0, 0, 0, 0];
  return [0, 1, 2, 3].map((index) => nonNegativeInteger(value[index])) as StrandsStats["hintDistribution"];
}

function utcDayGap(first: string | undefined, second: string) {
  if (!first || !isUtcDate(second)) return Number.NaN;
  return (Date.parse(`${second}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86_400_000;
}

function isUtcDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidGameDate(date: string) {
  return isPractice(date) || isUtcDate(date);
}

function isFoundWord(value: unknown): value is FoundWord {
  return isRecord(value) && typeof value.word === "string" && /^[A-Z]+$/.test(value.word) && typeof value.isSpangram === "boolean"
    && Array.isArray(value.path) && value.path.length > 0 && value.path.every(isPoint)
    && new Set(value.path.map(({ r, c }) => `${r},${c}`)).size === value.path.length;
}

function isPoint(value: unknown): value is Point {
  return isRecord(value) && isNonNegativeInteger(value.r) && isNonNegativeInteger(value.c);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function nonNegativeInteger(value: unknown) {
  return isNonNegativeInteger(value) ? value : 0;
}
