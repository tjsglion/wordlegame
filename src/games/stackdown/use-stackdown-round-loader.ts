"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { loadGameData } from "@/lib/game/storage";
import { loadStackdownStats } from "./stackdown-client-storage";
import {
  reconstructProgress,
  type BoardTile,
  type PersistedDaily,
  type SlotTile,
} from "./stackdown-client-model";
import type { StackdownStats } from "./persistence";
import type { GameMode, StackdownStartResponse } from "./shared";

export type StackdownStatus = "loading" | "error" | "playing" | "won";

const SLUG = "stackdown";
const DAILY_KEY = "daily-v3";

/** Loads a fresh round or restores today's saved board; practice remains ephemeral. */
export function useStackdownRoundLoader({
  mode,
  reloadTick,
  cancelRoundAnimations,
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
}: {
  mode: GameMode;
  reloadTick: number;
  cancelRoundAnimations: () => void;
  resetTimer: (elapsedMs?: number) => void;
  setStatus: Dispatch<SetStateAction<StackdownStatus>>;
  setDateKey: Dispatch<SetStateAction<string | null>>;
  setToken: Dispatch<SetStateAction<string | null>>;
  setTiles: Dispatch<SetStateAction<BoardTile[]>>;
  setPresentIds: Dispatch<SetStateAction<number[]>>;
  setSlots: Dispatch<SetStateAction<SlotTile[]>>;
  setSolved: Dispatch<SetStateAction<string[]>>;
  setSolvedPicks: Dispatch<SetStateAction<number[][]>>;
  setHintsUsed: Dispatch<SetStateAction<number>>;
  setWordHints: Dispatch<SetStateAction<number[]>>;
  setClue: Dispatch<SetStateAction<string | null>>;
  setHintPending: Dispatch<SetStateAction<boolean>>;
  setSolveMarksMs: Dispatch<SetStateAction<number[]>>;
  setDailyUpdatedAt: Dispatch<SetStateAction<number>>;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  setJustWon: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<"invalidWord" | "networkError" | null>>;
  setStats: Dispatch<SetStateAction<StackdownStats>>;
}) {
  useEffect(() => {
    let cancelled = false;
    const applyFresh = (payload: StackdownStartResponse) => {
      setTiles(payload.tiles.map((tile, id) => ({ ...tile, id })));
      setPresentIds(payload.tiles.map((_, id) => id));
      setSlots([]);
      setSolved([]);
      setSolvedPicks([]);
      setHintsUsed(0);
      setWordHints([]);
      setClue(null);
      setHintPending(false);
      resetTimer();
      setSolveMarksMs([]);
      setDailyUpdatedAt(0);
      setStatus("playing");
    };
    async function load() {
      cancelRoundAnimations();
      setStatus("loading");
      setLoaded(false);
      setJustWon(false);
      setNotice(null);
      setToken(null);
      setDateKey(null);
      try {
        if (mode === "daily") {
          const res = await fetch("/api/stackdown");
          if (!res.ok) throw new Error(`load failed: ${res.status}`);
          const payload = (await res.json()) as StackdownStartResponse;
          if (cancelled) return;
          setDateKey(payload.dateKey ?? null);
          const saved = loadGameData<PersistedDaily | null>(
            SLUG,
            DAILY_KEY,
            null,
          );
          if (
            saved &&
            saved.dateKey === payload.dateKey &&
            saved.tiles.length === payload.tiles.length
          ) {
            const { picks, wordHints: savedWordHints } =
              saved.solvedPicks && saved.wordHints
                ? { picks: saved.solvedPicks, wordHints: saved.wordHints }
                : reconstructProgress(saved);
            setTiles(saved.tiles.map((tile, id) => ({ ...tile, id })));
            setPresentIds(saved.presentIds);
            setSlots(saved.slots);
            setSolved(saved.solved);
            setSolvedPicks(picks);
            setHintsUsed(saved.hintsUsed);
            setWordHints(savedWordHints);
            setClue(saved.clue ?? null);
            setHintPending(false);
            resetTimer(saved.elapsedMs);
            setSolveMarksMs(saved.solveMarksMs);
            setDailyUpdatedAt(saved.updatedAt ?? 0);
            setStatus(saved.status);
          } else applyFresh(payload);
        } else {
          const res = await fetch("/api/stackdown", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "start-practice" }),
          });
          if (!res.ok) throw new Error(`load failed: ${res.status}`);
          const payload = (await res.json()) as StackdownStartResponse;
          if (cancelled) return;
          setToken(payload.token ?? null);
          applyFresh(payload);
        }
        if (!cancelled) {
          setStats(loadStackdownStats(mode));
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    cancelRoundAnimations,
    mode,
    reloadTick,
    resetTimer,
    setClue,
    setDailyUpdatedAt,
    setDateKey,
    setHintPending,
    setHintsUsed,
    setJustWon,
    setLoaded,
    setNotice,
    setPresentIds,
    setSlots,
    setSolveMarksMs,
    setSolved,
    setSolvedPicks,
    setStats,
    setStatus,
    setTiles,
    setToken,
    setWordHints,
  ]);
}
