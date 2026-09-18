"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import {
  dailyProjection,
  sameStatsContent,
  type BoardTile,
  type SlotTile,
} from "./stackdown-client-model";
import {
  normalizeStackdownDailyState,
  normalizeStackdownStats,
  type StackdownDailyState,
  type StackdownStats,
  type StackdownSyncRequest,
  type StackdownSyncResponse,
  type StackdownWordTime,
} from "./persistence";
import type { GameMode } from "./shared";

const SYNC_API = "/api/stackdown/sync";

async function postSync(
  body: StackdownSyncRequest,
): Promise<StackdownSyncResponse | null> {
  let res: Response;
  try {
    res = await fetch(SYNC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  return res.json() as Promise<StackdownSyncResponse>;
}

/** Synchronizes the mutable daily projection and stats without owning UI state. */
export function useStackdownSync({
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
  cancelRoundAnimations,
}: {
  mode: GameMode;
  isAuthenticated: boolean;
  loaded: boolean;
  stats: StackdownStats;
  solvedPicks: number[][];
  wordHints: number[];
  hintsUsed: number;
  status: "loading" | "error" | "playing" | "won";
  dailyUpdatedAt: number;
  elapsedRef: MutableRefObject<number>;
  statsRef: MutableRefObject<StackdownStats>;
  tilesRef: MutableRefObject<BoardTile[]>;
  dateKeyRef: MutableRefObject<string | null>;
  statusRef: MutableRefObject<"loading" | "error" | "playing" | "won">;
  solvedPicksRef: MutableRefObject<number[][]>;
  solveMarksMsRef: MutableRefObject<number[]>;
  wordHintsRef: MutableRefObject<number[]>;
  dailyUpdatedAtRef: MutableRefObject<number>;
  setPresentIds: Dispatch<SetStateAction<number[]>>;
  setSlots: Dispatch<SetStateAction<SlotTile[]>>;
  setSolvedPicks: Dispatch<SetStateAction<number[][]>>;
  setSolved: Dispatch<SetStateAction<string[]>>;
  setWordHints: Dispatch<SetStateAction<number[]>>;
  setHintsUsed: Dispatch<SetStateAction<number>>;
  setClue: Dispatch<SetStateAction<string | null>>;
  setHintPending: Dispatch<SetStateAction<boolean>>;
  setSolveMarksMs: Dispatch<SetStateAction<number[]>>;
  resetTimer: (elapsedMs?: number) => void;
  setDailyUpdatedAt: Dispatch<SetStateAction<number>>;
  setStatus: Dispatch<SetStateAction<"loading" | "error" | "playing" | "won">>;
  setStats: Dispatch<SetStateAction<StackdownStats>>;
  cancelRoundAnimations: () => void;
}) {
  const hasInitialSync = useRef(false);
  const snapshotDailyState = useCallback((): StackdownDailyState | null => {
    if (mode !== "daily" || !dateKeyRef.current) return null;
    const marks = solveMarksMsRef.current;
    const picks = solvedPicksRef.current;
    const wordTimes: StackdownWordTime[] = picks.map((_, index) => ({
      timeMs: Math.max(
        0,
        (marks[index] ?? 0) - (index === 0 ? 0 : (marks[index - 1] ?? 0)),
      ),
      hints: wordHintsRef.current[index] ?? 0,
    }));
    return {
      dateKey: dateKeyRef.current,
      picks,
      wordTimes,
      status: statusRef.current === "won" ? "won" : "playing",
      elapsedMs: elapsedRef.current,
      updatedAt: dailyUpdatedAtRef.current,
    };
  }, [
    mode,
    dateKeyRef,
    solveMarksMsRef,
    solvedPicksRef,
    wordHintsRef,
    statusRef,
    elapsedRef,
    dailyUpdatedAtRef,
  ]);

  const applySyncedDaily = useCallback(
    (state: StackdownDailyState) => {
      const boardTiles = tilesRef.current;
      if (boardTiles.length === 0) return;
      cancelRoundAnimations();
      const picked = new Set(state.picks.flat());
      setPresentIds(
        boardTiles.map((tile) => tile.id).filter((id) => !picked.has(id)),
      );
      setSlots([]);
      setSolvedPicks(state.picks);
      setSolved(
        state.picks.map((row) =>
          row.map((id) => boardTiles[id]?.letter ?? "").join(""),
        ),
      );
      setWordHints(state.wordTimes.map((word) => word.hints));
      setHintsUsed(state.wordTimes.reduce((sum, word) => sum + word.hints, 0));
      setClue(null);
      setHintPending(false);
      let mark = 0;
      setSolveMarksMs(
        state.wordTimes.map((word) => (mark += Math.max(0, word.timeMs))),
      );
      resetTimer(state.elapsedMs);
      setDailyUpdatedAt(state.updatedAt);
      setStatus(state.status);
    },
    [
      cancelRoundAnimations,
      tilesRef,
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
    ],
  );

  const applySyncResponse = useCallback(
    (
      response: StackdownSyncResponse,
      requestStats: StackdownStats,
      requestDailyState: StackdownDailyState | null,
    ) => {
      const nextStats = response.stats
        ? normalizeStackdownStats(response.stats)
        : requestStats;
      if (
        sameStatsContent(statsRef.current, requestStats) &&
        !sameStatsContent(statsRef.current, nextStats)
      )
        setStats({
          ...nextStats,
          lastDailyWin: nextStats.lastDailyWin ?? statsRef.current.lastDailyWin,
        });
      if (mode !== "daily") return;
      const nextDailyState = normalizeStackdownDailyState(response.dailyState);
      if (!nextDailyState || nextDailyState.dateKey !== dateKeyRef.current)
        return;
      const localStateNow = snapshotDailyState();
      if (
        dailyProjection(localStateNow) === dailyProjection(requestDailyState) &&
        dailyProjection(localStateNow) !== dailyProjection(nextDailyState)
      )
        applySyncedDaily(nextDailyState);
    },
    [
      mode,
      statsRef,
      setStats,
      dateKeyRef,
      snapshotDailyState,
      applySyncedDaily,
    ],
  );

  const flushSync = useCallback(async () => {
    if (!isAuthenticated || !loaded) return false;
    const requestStats = statsRef.current;
    const requestDailyState = snapshotDailyState();
    const response = await postSync({
      mode,
      stats: requestStats,
      dailyState: requestDailyState,
    });
    if (!response?.authenticated) return false;
    applySyncResponse(response, requestStats, requestDailyState);
    hasInitialSync.current = true;
    return true;
  }, [
    isAuthenticated,
    loaded,
    statsRef,
    snapshotDailyState,
    mode,
    applySyncResponse,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !loaded || hasInitialSync.current) return;
    const requestStats = statsRef.current;
    const requestDailyState = snapshotDailyState();
    let cancelled = false;
    void postSync({
      mode,
      stats: requestStats,
      dailyState: requestDailyState,
    }).then((response) => {
      if (cancelled || !response?.authenticated) return;
      applySyncResponse(response, requestStats, requestDailyState);
      hasInitialSync.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    loaded,
    statsRef,
    snapshotDailyState,
    mode,
    applySyncResponse,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !loaded || !hasInitialSync.current) return;
    const timeoutId = window.setTimeout(() => {
      void postSync({
        mode,
        stats: statsRef.current,
        dailyState: snapshotDailyState(),
      });
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [
    isAuthenticated,
    loaded,
    mode,
    stats,
    solvedPicks,
    wordHints,
    hintsUsed,
    status,
    dailyUpdatedAt,
    statsRef,
    snapshotDailyState,
  ]);

  useEffect(() => {
    if (status === "won") void flushSync();
  }, [status, flushSync]);
  return { flushSync };
}
