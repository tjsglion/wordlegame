"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitPath, useHint as getHintResult } from "./engine";
import { vibrateInvalid, vibrateSolved, vibrateWin } from "@/lib/game/haptics";
import {
  emptyStrandsStats,
  loadStrandsState,
  loadStrandsStats,
  saveStrandsState,
  saveStrandsStats,
  updateStrandsStats,
  type StrandsStats,
} from "./persistence";
import {
  getStrandsThemeLabel,
  pathsOverlap,
  STRANDS_CELL_COUNT,
  STRANDS_COLUMNS,
  type FoundWord,
  type InteractionMode,
  type Point,
  type StrandsPuzzleData,
} from "./shared";
import { IDLE_POINTER, isSamePoint, transitionStrandsPointer, type StrandsPointerEvent, type StrandsPointerState } from "./strands-session";

export type StrandsMode = "daily" | "practice";

export type { StrandsPointerEvent, StrandsPointerState } from "./strands-session";

export interface StrandsVictoryCallbacks {
  showConfetti?: () => void;
  stopConfetti?: () => void;
  showWinModal?: () => void;
}

export interface StrandsShareInput {
  theme: string;
  hintsUsed: number;
  mode: StrandsMode;
  url: string;
  foundWords: FoundWord[];
  copy?: StrandsShareCopy;
}

type StrandsFeedbackKind =
  | "already-found"
  | "already-counted"
  | "spangram-edge"
  | "too-short"
  | "unknown"
  | "charged"
  | "no-hint";

export interface StrandsShareCopy {
  dailyTitle: string;
  practiceTitle: string;
  hintsUsedLabel: string;
  noneLabel: string;
  playAtLabel: string;
  copiedLabel: string;
  failedLabel: string;
}

export type StrandsFeedbackCopy = Record<StrandsFeedbackKind, string>;

export interface UseStrandsGameState {
  foundWords: FoundWord[];
  isSpangramFound: boolean;
  meter: number;
  hints: number;
  scoreSubmitted: boolean;
  hintCells: Point[];
  chargedWords: string[];
  justWon: boolean;
  errorPath: Point[];
  message: string | null;
  path: Point[];
  interactionMode: InteractionMode;
  isLoaded: boolean;
  isWon: boolean;
  stats: StrandsStats;
  shouldCelebrate: boolean;
}

export interface UseStrandsGame {
  state: UseStrandsGameState;
  pointerDown(point: Point): void;
  pointerMove(point: Point, buttons: number): void;
  pointerUp(): void;
  activateCell(point: Point): void;
  submit(path?: Point[]): void;
  useHint(): void;
  clearPath(): void;
  shareText: string;
  share(): Promise<void>;
}

export { transitionStrandsPointer } from "./strands-session";

export function shouldScheduleStrandsVictory({ isLoaded, isWon, justWon }: { isLoaded: boolean; isWon: boolean; justWon: boolean }) {
  return isLoaded && isWon && justWon;
}

export function getStrandsVictorySchedule(shouldCelebrate: boolean) {
  return shouldCelebrate
    ? [
      { action: "start-confetti" as const, delay: 50 },
      { action: "stop-confetti" as const, delay: 3050 },
      { action: "show-win-modal" as const, delay: 1500 },
    ]
    : [];
}

const VICTORY_TIMER_KEYS = ["victory-start-confetti", "victory-stop-confetti", "victory-show-win-modal"] as const;

const DEFAULT_STRANDS_SHARE_COPY: StrandsShareCopy = {
  dailyTitle: "Strands",
  practiceTitle: "Strands (Practice)",
  hintsUsedLabel: "Hints used: {count}",
  noneLabel: "None",
  playAtLabel: "Play at: {url}",
  copiedLabel: "Share text copied",
  failedLabel: "Could not share. Try again.",
};

const DEFAULT_STRANDS_FEEDBACK_COPY: StrandsFeedbackCopy = {
  "already-found": "Already found",
  "already-counted": "Already counted",
  "spangram-edge": "Spangram must touch opposite edges",
  "too-short": "Too short",
  unknown: "Not in word list",
  charged: "Good word!",
  "no-hint": "No hint available",
};

function interpolate(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : "",
  );
}

export function getStrandsPuzzleTransition(previousIdentity: string | null, nextIdentity: string) {
  const changed = previousIdentity !== null && previousIdentity !== nextIdentity;
  return { changed, cancelTimerKeys: changed ? [...VICTORY_TIMER_KEYS] : [], resetVisuals: changed };
}

/**
 * NYT-style share card: the finished board as an emoji dot grid — 🔵 theme
 * words, 🟡 the spangram, ⬜ cells not yet covered (practice/early share).
 * Spangram is painted last so it always wins its cells.
 */
export function buildStrandsShareGrid(foundWords: FoundWord[]): string {
  const cells = Array.from({ length: STRANDS_CELL_COUNT }, () => "⬜");
  for (const found of foundWords) {
    if (found.isSpangram) continue;
    for (const { r, c } of found.path) cells[r * STRANDS_COLUMNS + c] = "🔵";
  }
  for (const found of foundWords) {
    if (!found.isSpangram) continue;
    for (const { r, c } of found.path) cells[r * STRANDS_COLUMNS + c] = "🟡";
  }
  const rows: string[] = [];
  for (let index = 0; index < cells.length; index += STRANDS_COLUMNS) {
    rows.push(cells.slice(index, index + STRANDS_COLUMNS).join(""));
  }
  return rows.join("\n");
}

export function buildStrandsShareText({
  theme,
  hintsUsed,
  mode,
  url,
  foundWords,
  copy = DEFAULT_STRANDS_SHARE_COPY,
}: StrandsShareInput) {
  return `${mode === "practice" ? copy.practiceTitle : copy.dailyTitle}\n${theme}\n${buildStrandsShareGrid(foundWords)}\n${interpolate(
    copy.hintsUsedLabel,
    {
      count: hintsUsed === 0 ? copy.noneLabel : hintsUsed,
    },
  )}\n${interpolate(copy.playAtLabel, { url })}`;
}

export function getStrandsFeedback(
  kind: StrandsFeedbackKind,
  copy: StrandsFeedbackCopy = DEFAULT_STRANDS_FEEDBACK_COPY,
) {
  return copy[kind];
}

/** Makes reducer-like transitions explicit for pure tests and hook setters. */
export function applyStrandsStateUpdate<T>(current: T, update: (current: T) => T) {
  return update(current);
}

export function useStrands(data: StrandsPuzzleData, mode: StrandsMode, victoryCallbacks: StrandsVictoryCallbacks = {}): UseStrandsGame {
  const t = useTranslations("Strands");
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [hintMeter, setHintMeter] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [hintCells, setHintCells] = useState<Point[]>([]);
  const [chargedWords, setChargedWords] = useState<string[]>([]);
  const [justWon, setJustWon] = useState(false);
  const [errorPath, setErrorPath] = useState<Point[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pointer, setPointer] = useState<StrandsPointerState>(IDLE_POINTER);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  const [stats, setStats] = useState<StrandsStats>(emptyStrandsStats);
  const refs = useRef({ foundWords, hintMeter, totalHintsUsed, scoreSubmitted, hintCells, chargedWords, justWon, errorPath, message, pointer, loadedDate, stats });
  const timers = useRef(new Map<string, number>());
  const celebratedDate = useRef<string | null>(null);
  const victoryCallbacksRef = useRef(victoryCallbacks);
  const puzzleIdentity = `${data.date}:${data.puzzle.id}`;
  const previousPuzzleIdentity = useRef<string | null>(null);
  const isLoaded = loadedDate === data.date;
  const isSpangramFound = foundWords.some((word) => word.isSpangram);
  const isWon = foundWords.length === data.puzzle.words.length + 1;
  const shouldCelebrate = shouldScheduleStrandsVictory({ isLoaded, isWon, justWon });
  const feedbackCopy = useMemo<StrandsFeedbackCopy>(() => ({
    "already-found": t("feedback.alreadyFound"),
    "already-counted": t("feedback.alreadyCounted"),
    "spangram-edge": t("feedback.spangramEdge"),
    "too-short": t("feedback.tooShort"),
    unknown: t("feedback.unknown"),
    charged: t("feedback.charged"),
    "no-hint": t("feedback.noHint"),
  }), [t]);
  // hintsUsed/playAt carry {count}/{url} placeholders for later interpolate()
  // — read them raw so next-intl doesn't try to format them here.
  const shareCopy = useMemo<StrandsShareCopy>(() => ({
    dailyTitle: t("shareText.dailyTitle"),
    practiceTitle: t("shareText.practiceTitle"),
    hintsUsedLabel: t.raw("shareText.hintsUsed") as string,
    noneLabel: t("shareText.none"),
    playAtLabel: t.raw("shareText.playAt") as string,
    copiedLabel: t("shareCopied"),
    failedLabel: t("shareFailed"),
  }), [t]);

  const setCurrent = useCallback(<K extends keyof typeof refs.current>(key: K, update: (current: (typeof refs.current)[K]) => (typeof refs.current)[K]) => {
    const setters = { foundWords: setFoundWords, hintMeter: setHintMeter, totalHintsUsed: setTotalHintsUsed, scoreSubmitted: setScoreSubmitted, hintCells: setHintCells, chargedWords: setChargedWords, justWon: setJustWon, errorPath: setErrorPath, message: setMessage, pointer: setPointer, loadedDate: setLoadedDate, stats: setStats } as const;
    const next = applyStrandsStateUpdate(refs.current[key], update);
    // Event handlers serialize through refs, while React receives a pure setter.
    refs.current[key] = next;
    (setters[key] as unknown as (updater: () => (typeof refs.current)[K]) => void)(() => next);
  }, []);

  const schedule = useCallback((key: string, callback: () => void, delay: number) => {
    const previous = timers.current.get(key);
    if (previous !== undefined) window.clearTimeout(previous);
    const id = window.setTimeout(() => { timers.current.delete(key); callback(); }, delay);
    timers.current.set(key, id);
  }, []);

  const cancelTimer = useCallback((key: string) => {
    const id = timers.current.get(key);
    if (id !== undefined) window.clearTimeout(id);
    timers.current.delete(key);
  }, []);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  useEffect(() => {
    victoryCallbacksRef.current = victoryCallbacks;
  }, [victoryCallbacks]);

  useEffect(() => {
    const transition = getStrandsPuzzleTransition(previousPuzzleIdentity.current, puzzleIdentity);
    transition.cancelTimerKeys.forEach(cancelTimer);
    if (transition.resetVisuals) {
      victoryCallbacksRef.current.stopConfetti?.();
      celebratedDate.current = null;
    }
    previousPuzzleIdentity.current = puzzleIdentity;
    const saved = loadStrandsState(data.date, data.puzzle.id);
    setCurrent("foundWords", () => saved?.foundWords ?? []);
    setCurrent("hintMeter", () => saved?.hintMeter ?? 0);
    setCurrent("totalHintsUsed", () => saved?.totalHintsUsed ?? 0);
    setCurrent("scoreSubmitted", () => saved?.scoreSubmitted ?? false);
    setCurrent("hintCells", () => saved?.hintCells ?? []);
    setCurrent("chargedWords", () => saved?.chargedWords ?? []);
    setCurrent("justWon", () => false);
    setCurrent("pointer", () => IDLE_POINTER);
    setCurrent("errorPath", () => []);
    setCurrent("message", () => null);
    setCurrent("stats", () => loadStrandsStats());
    setCurrent("loadedDate", () => data.date);
  }, [cancelTimer, data.date, mode, puzzleIdentity, setCurrent]);

  useEffect(() => {
    if (!isLoaded) return;
    saveStrandsState({ date: data.date, puzzleId: data.puzzle.id, foundWords, hintMeter, totalHintsUsed, scoreSubmitted, chargedWords, hintCells });
  }, [chargedWords, data.date, data.puzzle.id, foundWords, hintCells, hintMeter, isLoaded, scoreSubmitted, totalHintsUsed]);

  useEffect(() => {
    if (!isLoaded || mode !== "daily") return;
    saveStrandsStats(stats);
  }, [isLoaded, mode, stats]);

  useEffect(() => {
    if (!shouldCelebrate || celebratedDate.current === data.date) return;
    celebratedDate.current = data.date;
    for (const item of getStrandsVictorySchedule(true)) {
      schedule(`victory-${item.action}`, () => {
        if (item.action === "start-confetti") victoryCallbacksRef.current.showConfetti?.();
        if (item.action === "stop-confetti") victoryCallbacksRef.current.stopConfetti?.();
        if (item.action === "show-win-modal") victoryCallbacksRef.current.showWinModal?.();
      }, item.delay);
    }
  }, [data.date, schedule, shouldCelebrate]);

  const showFeedback = useCallback((path: Point[], text: string) => {
    setCurrent("errorPath", () => path);
    setCurrent("message", () => text);
    schedule("error", () => setCurrent("errorPath", () => []), 600);
    schedule("message", () => setCurrent("message", () => null), 2000);
  }, [schedule, setCurrent]);

  const submit = useCallback((path = refs.current.pointer.path) => {
    const current = refs.current;
    const won = current.foundWords.length === data.puzzle.words.length + 1;
    if (current.loadedDate !== data.date || won || path.length === 0) return;
    setCurrent("pointer", () => IDLE_POINTER);
    const result = submitPath({ puzzle: data.puzzle, foundWords: current.foundWords, chargedWords: current.chargedWords, hintMeter: current.hintMeter }, path);
    if (result.kind === "found") {
      setCurrent("foundWords", (words) => [...words, result.foundWord]);
      if (result.isWin) vibrateWin();
      else vibrateSolved();
      if (current.hintCells.length && pathsOverlap(result.foundWord.path, current.hintCells)) setCurrent("hintCells", () => []);
      if (result.isWin) {
        setCurrent("justWon", () => true);
          if (mode === "daily") {
            setCurrent("stats", (stats) => updateStrandsStats(stats, data.date, true, current.totalHintsUsed));
            // Completion is intentionally local until the server owns the
            // per-word session. A client POST cannot prove a player solved a
            // board and must not be represented as a trusted score.
            setCurrent("scoreSubmitted", () => false);
          }
      }
      return;
    }
    if (result.kind === "charged") {
      setCurrent("chargedWords", (words) => [...words, result.word]);
      setCurrent("hintMeter", () => result.hintMeter);
      showFeedback([], getStrandsFeedback("charged", feedbackCopy));
      return;
    }
    showFeedback(result.errorPath, getStrandsFeedback(result.kind, feedbackCopy));
    vibrateInvalid();
  }, [data.date, data.puzzle, feedbackCopy, mode, setCurrent, showFeedback]);

  const transition = useCallback((event: StrandsPointerEvent) => {
    const current = refs.current;
    if (current.loadedDate !== data.date || current.foundWords.length === data.puzzle.words.length + 1) return;
    const locked = event.kind === "up" ? event : { ...event, locked: event.locked || current.foundWords.some((word) => word.path.some((cell) => isSamePoint(cell, event.point))) };
    const next = transitionStrandsPointer(current.pointer, locked);
    setCurrent("pointer", () => next.state);
    if (next.submitPath) submit(next.submitPath);
  }, [data.date, data.puzzle.words.length, setCurrent, submit]);

  const pointerDown = useCallback((point: Point) => transition({ kind: "down", point, locked: false }), [transition]);
  const pointerMove = useCallback((point: Point, buttons: number) => transition({ kind: "move", point, buttons, locked: false }), [transition]);
  const pointerUp = useCallback(() => transition({ kind: "up" }), [transition]);
  const activateCell = useCallback((point: Point) => transition({ kind: "activate", point, locked: false }), [transition]);
  const useHint = useCallback(() => {
    const current = refs.current;
    if (current.loadedDate !== data.date || current.hintMeter !== 3 || current.foundWords.length === data.puzzle.words.length + 1) return;
    const result = getHintResult({ puzzle: data.puzzle, foundWords: current.foundWords, hintMeter: current.hintMeter, totalHintsUsed: current.totalHintsUsed });
    if (result.kind === "hint") { setCurrent("hintMeter", () => result.hintMeter); setCurrent("totalHintsUsed", () => result.totalHintsUsed); setCurrent("hintCells", () => result.path); }
    else if (result.kind === "no-hint") { showFeedback([], getStrandsFeedback("no-hint", feedbackCopy)); vibrateInvalid(); }
  }, [data.date, data.puzzle, feedbackCopy, setCurrent, showFeedback]);
  const shareText = buildStrandsShareText({ theme: getStrandsThemeLabel(data.puzzle), hintsUsed: totalHintsUsed, mode, url: typeof window === "undefined" ? "" : window.location.href, foundWords, copy: shareCopy });
  const share = useCallback(async () => {
    const text = buildStrandsShareText({
      theme: getStrandsThemeLabel(data.puzzle),
      hintsUsed: refs.current.totalHintsUsed,
      mode,
      url: window.location.href,
      foundWords: refs.current.foundWords,
      copy: shareCopy,
    });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        setCurrent("message", () => shareCopy.copiedLabel);
        schedule("message", () => setCurrent("message", () => null), 2000);
        return;
      }
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setCurrent("message", () => shareCopy.copiedLabel);
      schedule("message", () => setCurrent("message", () => null), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCurrent("message", () => shareCopy.failedLabel);
      schedule("message", () => setCurrent("message", () => null), 3000);
    }
  }, [data.puzzle, mode, schedule, setCurrent, shareCopy]);
  const state = useMemo<UseStrandsGameState>(() => ({ foundWords, isSpangramFound, meter: hintMeter, hints: totalHintsUsed, scoreSubmitted, hintCells, chargedWords, justWon, errorPath, message, path: pointer.path, interactionMode: pointer.mode, isLoaded, isWon, stats, shouldCelebrate }), [chargedWords, errorPath, foundWords, hintCells, hintMeter, isLoaded, isSpangramFound, isWon, justWon, message, pointer, scoreSubmitted, shouldCelebrate, stats, totalHintsUsed]);
  return { state, pointerDown, pointerMove, pointerUp, activateCell, submit, useHint, clearPath: () => setCurrent("pointer", () => IDLE_POINTER), shareText, share };
}
