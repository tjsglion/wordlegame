"use client";

import { useCallback, useEffect, type MutableRefObject } from "react";
import { saveGameData } from "@/lib/game/storage";
import { stackdownStatsKey, type StackdownStats } from "./persistence";
import type { BoardTile, PendingReturn, SlotTile } from "./stackdown-client-model";
import { createPersistedDailySnapshot } from "./stackdown-client-model";
import type { GameMode } from "./shared";

const SLUG = "stackdown";
const DAILY_KEY = "daily-v3";

type DailySnapshotInput = {
  dateKey: string;
  tiles: BoardTile[];
  presentIds: number[];
  slots: SlotTile[];
  solved: string[];
  solvedPicks: number[][];
  hintsUsed: number;
  wordHints: number[];
  clue: string | null;
  solveMarksMs: number[];
  status: "playing" | "won";
  dailyUpdatedAt: number;
  elapsedMs: number;
};

/** Owns local daily-round and per-mode stats persistence. */
export function useStackdownPersistence({
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
  pendingReturnRef,
  stats,
  onHide,
}: Omit<DailySnapshotInput, "dateKey" | "status" | "elapsedMs"> & {
  loaded: boolean;
  mode: GameMode;
  dateKey: string | null;
  status: "loading" | "error" | "playing" | "won";
  elapsedRef: MutableRefObject<number>;
  pendingReturnRef: MutableRefObject<PendingReturn | null>;
  stats: StackdownStats;
  onHide: () => void;
}) {
  const saveDaily = useCallback(() => {
    if (!dateKey || (status !== "playing" && status !== "won")) return;
    saveGameData(
      SLUG,
      DAILY_KEY,
      createPersistedDailySnapshot(
        { dateKey, tiles, presentIds, slots, solved, solvedPicks, hintsUsed, wordHints, clue, solveMarksMs, status, dailyUpdatedAt, elapsedMs: elapsedRef.current },
        pendingReturnRef.current,
      ),
    );
  }, [clue, dailyUpdatedAt, dateKey, elapsedRef, hintsUsed, pendingReturnRef, presentIds, slots, solveMarksMs, solved, solvedPicks, status, tiles, wordHints]);

  useEffect(() => {
    if (!loaded || mode !== "daily" || !dateKey) return;
    if (status !== "playing" && status !== "won") return;
    saveDaily();
  }, [dateKey, loaded, mode, status, saveDaily]);

  useEffect(() => {
    if (!loaded) return;
    saveGameData(SLUG, stackdownStatsKey(mode), stats);
  }, [loaded, mode, stats]);

  useEffect(() => {
    if (!loaded || mode !== "daily" || !dateKey) return;
    if (status !== "playing" && status !== "won") return;
    const saveOnHide = () => {
      if (!document.hidden) return;
      saveDaily();
      onHide();
    };
    document.addEventListener("visibilitychange", saveOnHide);
    return () => document.removeEventListener("visibilitychange", saveOnHide);
  }, [dateKey, loaded, mode, status, saveDaily, onHide]);
}

export function clearStackdownDailyStorage(): void {
  saveGameData(SLUG, DAILY_KEY, null);
}
