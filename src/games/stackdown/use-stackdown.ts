"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyStackdownStats, type StackdownStats } from "./persistence";
import {
  type BoardTile,
  type SlotTile,
} from "./stackdown-client-model";
import { exposedTileIds, WORDS_PER_PUZZLE, type GameMode } from "./shared";
import {
  clearStackdownDailyStorage,
  useStackdownPersistence,
} from "./use-stackdown-persistence";
import { useStackdownRoundInteractions } from "./use-stackdown-round-interactions";
import {
  useStackdownRoundLoader,
  type StackdownStatus,
} from "./use-stackdown-round-loader";
import { useStackdownSync } from "./use-stackdown-sync";
import { useStackdownTimer } from "./use-stackdown-timer";

export type { GameMode } from "./shared";
export type { StackdownStats } from "./persistence";
export type { StackdownStatus } from "./use-stackdown-round-loader";
export type { BoardTile, SlotTile } from "./stackdown-client-model";
export { formatTime } from "./stackdown-client-model";
export { loadStackdownStats } from "./stackdown-client-storage";
export type NoticeKey = "invalidWord" | "networkError";

/** Composes the Stackdown client modules into the stable game-facing API. */
export function useStackdown(mode: GameMode, isAuthenticated = false) {
  const [status, setStatus] = useState<StackdownStatus>("loading");
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tiles, setTiles] = useState<BoardTile[]>([]);
  const [presentIds, setPresentIds] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotTile[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const [solvedPicks, setSolvedPicks] = useState<number[][]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wordHints, setWordHints] = useState<number[]>([]);
  const [clue, setClue] = useState<string | null>(null);
  const [hintPending, setHintPending] = useState(false);
  const [notice, setNotice] = useState<NoticeKey | null>(null);
  const [shake, setShake] = useState(false);
  const [solving, setSolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settlingFinalPick, setSettlingFinalPick] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnFromIndex, setReturnFromIndex] = useState<number | null>(null);
  const [justWon, setJustWon] = useState(false);
  const [solveMarksMs, setSolveMarksMs] = useState<number[]>([]);
  const [stats, setStats] = useState<StackdownStats>(emptyStackdownStats);
  const [dailyUpdatedAt, setDailyUpdatedAt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const { elapsedMs, elapsedRef, reset: resetTimer } = useStackdownTimer(
    status === "playing",
  );
  const statsRef = useRef(stats);
  const tilesRef = useRef(tiles);
  const dateKeyRef = useRef(dateKey);
  const statusRef = useRef(status);
  const solvedPicksRef = useRef(solvedPicks);
  const solveMarksMsRef = useRef(solveMarksMs);
  const wordHintsRef = useRef(wordHints);
  const hintsUsedRef = useRef(hintsUsed);
  const dailyUpdatedAtRef = useRef(dailyUpdatedAt);
  const solvedCountRef = useRef(solved.length);
  const clueRef = useRef(clue);
  const hintPendingRef = useRef(hintPending);

  useEffect(() => {
    statsRef.current = stats;
    tilesRef.current = tiles;
    dateKeyRef.current = dateKey;
    statusRef.current = status;
    solvedPicksRef.current = solvedPicks;
    solveMarksMsRef.current = solveMarksMs;
    wordHintsRef.current = wordHints;
    hintsUsedRef.current = hintsUsed;
    dailyUpdatedAtRef.current = dailyUpdatedAt;
    solvedCountRef.current = solved.length;
    clueRef.current = clue;
    hintPendingRef.current = hintPending;
  }, [
    clue,
    dailyUpdatedAt,
    hintPending,
    hintsUsed,
    solveMarksMs,
    solved.length,
    solvedPicks,
    stats,
    status,
    tiles,
    wordHints,
    dateKey,
  ]);

  const retry = useCallback(() => setReloadTick((tick) => tick + 1), []);
  const handleDesync = useCallback(() => {
    if (mode === "daily") clearStackdownDailyStorage();
    retry();
  }, [mode, retry]);
  const interactions = useStackdownRoundInteractions({
    mode,
    status,
    token,
    tiles,
    presentIds,
    slots,
    solved,
    submitting,
    settlingFinalPick,
    dateKey,
    elapsedRef,
    statusRef,
    solvedCountRef,
    clueRef,
    hintPendingRef,
    hintsUsedRef,
    setStatus,
    setPresentIds,
    setSlots,
    setSolved,
    setSolvedPicks,
    setHintsUsed,
    setWordHints,
    setClue,
    setHintPending,
    setNotice,
    setShake,
    setSolving,
    setSubmitting,
    setSettlingFinalPick,
    setReturning,
    setReturnFromIndex,
    setJustWon,
    setSolveMarksMs,
    setDailyUpdatedAt,
    setStats,
    onDesync: handleDesync,
  });

  useStackdownRoundLoader({
    mode,
    reloadTick,
    cancelRoundAnimations: interactions.cancelRoundAnimations,
    resetTimer,
    setStatus,
    setDateKey,
    setToken,
    setTiles,
    setPresentIds,
    setSlots,
    setSolved,
    setSolvedPicks,
    setHintsUsed,
    setWordHints,
    setClue,
    setHintPending,
    setSolveMarksMs,
    setDailyUpdatedAt,
    setLoaded,
    setJustWon,
    setNotice,
    setStats,
  });

  const { flushSync } = useStackdownSync({
    mode,
    isAuthenticated,
    loaded,
    stats,
    solvedPicks,
    wordHints,
    hintsUsed,
    status,
    dailyUpdatedAt,
    elapsedRef,
    statsRef,
    tilesRef,
    dateKeyRef,
    statusRef,
    solvedPicksRef,
    solveMarksMsRef,
    wordHintsRef,
    dailyUpdatedAtRef,
    setPresentIds,
    setSlots,
    setSolvedPicks,
    setSolved,
    setWordHints,
    setHintsUsed,
    setClue,
    setHintPending,
    setSolveMarksMs,
    resetTimer,
    setDailyUpdatedAt,
    setStatus,
    setStats,
    cancelRoundAnimations: interactions.cancelRoundAnimations,
  });

  const flushOnHide = useCallback(() => {
    void flushSync();
  }, [flushSync]);

  useStackdownPersistence({
    loaded,
    mode,
    dateKey,
    tiles,
    presentIds,
    slots,
    solved,
    solvedPicks,
    hintsUsed,
    wordHints,
    clue,
    solveMarksMs,
    status,
    dailyUpdatedAt,
    elapsedRef,
    pendingReturnRef: interactions.pendingReturnRef,
    stats,
    onHide: flushOnHide,
  });

  useEffect(() => {
    if (!notice) return;
    const timerId = window.setTimeout(() => setNotice(null), 1600);
    return () => window.clearTimeout(timerId);
  }, [notice]);

  const exposed = useMemo(
    () => exposedTileIds(tiles, presentIds),
    [presentIds, tiles],
  );
  const wordTimesMs = useMemo(
    () => solveMarksMs.map(
      (mark, index) => mark - (index === 0 ? 0 : solveMarksMs[index - 1]),
    ),
    [solveMarksMs],
  );

  return {
    status,
    dateKey,
    tiles,
    presentIds,
    exposed,
    slots,
    solved,
    lastSolved: solved.at(-1) ?? null,
    hintsUsed,
    clue,
    notice,
    shake,
    returning,
    returnFromIndex,
    solving,
    submitting,
    settlingFinalPick,
    hintPending,
    justWon,
    elapsedMs,
    wordTimesMs,
    stats,
    totalWords: WORDS_PER_PUZZLE,
    pick: interactions.pick,
    unpick: interactions.unpick,
    useHint: interactions.useHint,
    completeReturn: interactions.completeReturn,
    flushSync,
    retry,
  };
}
