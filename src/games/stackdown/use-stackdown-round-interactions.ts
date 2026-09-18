"use client";

import { useCallback, useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { vibrateSolved } from "@/lib/game/haptics";
import { playInvalid, playKey, playSolved, playWin } from "@/lib/game/sound";
import {
  finalPickSubmitDelay,
  exposedTileIds,
  WORD_LENGTH,
  WORDS_PER_PUZZLE,
  type GameMode,
  type StackdownGuessResponse,
  type StackdownHintResponse,
} from "./shared";
import { prefersReducedMotion } from "./stackdown-motion";
import {
  recordStackdownWin,
  type BoardTile,
  type PendingReturn,
  type SlotTile,
} from "./stackdown-client-model";
import type { StackdownStats } from "./persistence";
const SOLVED_FLASH_MS = 650;

type NoticeKey = "invalidWord" | "networkError";
type StackdownStatus = "loading" | "error" | "playing" | "won";

interface StackdownRoundInteractionOptions {
  mode: GameMode;
  status: StackdownStatus;
  token: string | null;
  tiles: BoardTile[];
  presentIds: number[];
  slots: SlotTile[];
  solved: string[];
  submitting: boolean;
  settlingFinalPick: boolean;
  dateKey: string | null;
  elapsedRef: MutableRefObject<number>;
  statusRef: MutableRefObject<StackdownStatus>;
  solvedCountRef: MutableRefObject<number>;
  clueRef: MutableRefObject<string | null>;
  hintPendingRef: MutableRefObject<boolean>;
  hintsUsedRef: MutableRefObject<number>;
  setStatus: Dispatch<SetStateAction<StackdownStatus>>;
  setPresentIds: Dispatch<SetStateAction<number[]>>;
  setSlots: Dispatch<SetStateAction<SlotTile[]>>;
  setSolved: Dispatch<SetStateAction<string[]>>;
  setSolvedPicks: Dispatch<SetStateAction<number[][]>>;
  setHintsUsed: Dispatch<SetStateAction<number>>;
  setWordHints: Dispatch<SetStateAction<number[]>>;
  setClue: Dispatch<SetStateAction<string | null>>;
  setHintPending: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<NoticeKey | null>>;
  setShake: Dispatch<SetStateAction<boolean>>;
  setSolving: Dispatch<SetStateAction<boolean>>;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setSettlingFinalPick: Dispatch<SetStateAction<boolean>>;
  setReturning: Dispatch<SetStateAction<boolean>>;
  setReturnFromIndex: Dispatch<SetStateAction<number | null>>;
  setJustWon: Dispatch<SetStateAction<boolean>>;
  setSolveMarksMs: Dispatch<SetStateAction<number[]>>;
  setDailyUpdatedAt: Dispatch<SetStateAction<number>>;
  setStats: Dispatch<SetStateAction<StackdownStats>>;
  onDesync: () => void;
}

/** Owns tile selection, validation requests, and the transient round feedback. */
export function useStackdownRoundInteractions({
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
  onDesync,
}: StackdownRoundInteractionOptions) {
  const pendingReturnRef = useRef<PendingReturn | null>(null);
  const timerIdsRef = useRef(new Set<number>());
  const generationRef = useRef(0);

  const invalidatePendingWork = useCallback(() => {
    generationRef.current += 1;
    timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timerIdsRef.current.clear();
    pendingReturnRef.current = null;
    hintPendingRef.current = false;
  }, [hintPendingRef]);

  useEffect(
    () => () => {
      invalidatePendingWork();
    },
    [invalidatePendingWork],
  );

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      timerIdsRef.current.delete(timerId);
      callback();
    }, delay);
    timerIdsRef.current.add(timerId);
  }, []);

  const cancelRoundAnimations = useCallback(() => {
    invalidatePendingWork();
    setHintPending(false);
    setReturning(false);
    setReturnFromIndex(null);
    setSettlingFinalPick(false);
    setShake(false);
    setSolving(false);
    setSubmitting(false);
  }, [invalidatePendingWork, setHintPending, setReturning, setReturnFromIndex, setSettlingFinalPick, setShake, setSolving, setSubmitting]);

  const completeReturn = useCallback(() => {
    const pendingReturn = pendingReturnRef.current;
    if (!pendingReturn) return;

    const returnedTileIds = pendingReturn.slots
      .slice(pendingReturn.fromIndex)
      .map((slot) => slot.tileId);
    setSlots(pendingReturn.slots.slice(0, pendingReturn.fromIndex));
    setPresentIds([...pendingReturn.presentIds, ...returnedTileIds]);
    pendingReturnRef.current = null;
    setReturning(false);
    setReturnFromIndex(null);
    setShake(false);
    setSubmitting(false);
  }, [setPresentIds, setReturning, setReturnFromIndex, setShake, setSlots, setSubmitting]);

  const beginReturn = useCallback((fromIndex: number, currentSlots: SlotTile[], currentPresentIds: number[]) => {
    pendingReturnRef.current = {
      slots: currentSlots,
      presentIds: currentPresentIds,
      fromIndex,
    };
    setReturning(true);
    setReturnFromIndex(fromIndex);
  }, [setReturning, setReturnFromIndex]);

  const reloadAfterDesync = useCallback(() => {
    onDesync();
  }, [onDesync]);

  const requestBody = useCallback(() => ({
    mode,
    ...(mode === "practice" ? { token } : {}),
    solved,
  }), [mode, solved, token]);

  const submitWord = useCallback(async (currentSlots: SlotTile[], currentPresentIds: number[]) => {
    const generation = generationRef.current;
    const word = currentSlots.map((slot) => slot.letter).join("");
    setSettlingFinalPick(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/stackdown", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...requestBody(),
          action: "guess",
          tiles: currentSlots.map((slot) => slot.tileId),
        }),
      });
      if (generation !== generationRef.current) return;
      if (response.status === 409) {
        reloadAfterDesync();
        return;
      }
      if (!response.ok) throw new Error(`guess failed: ${response.status}`);
      const data = (await response.json()) as StackdownGuessResponse;

      if (!data.ok) {
        playInvalid();
        setNotice("invalidWord");
        setShake(true);
        beginReturn(0, currentSlots, currentPresentIds);
        return;
      }

      playSolved();
      vibrateSolved();
      const solveMark = elapsedRef.current;
      setSolving(true);
      schedule(() => {
        if (generation !== generationRef.current) return;
        setSolving(false);
        setSlots([]);
        setSolved((previous) => [...previous, word]);
        setSolvedPicks((previous) => [
          ...previous,
          currentSlots.map((slot) => slot.tileId),
        ]);
        setSolveMarksMs((previous) => [...previous, solveMark]);
        setWordHints((previous) => [
          ...previous,
          hintsUsedRef.current - previous.reduce((sum, hints) => sum + hints, 0),
        ]);
        setClue(null);
        hintPendingRef.current = false;
        setHintPending(false);
        if (mode === "daily") setDailyUpdatedAt(Date.now());

        if (data.finished) {
          setStatus("won");
          setJustWon(true);
          playWin();
          setStats((previous) => recordStackdownWin(previous, {
            mode,
            dateKey,
            hintsUsed: hintsUsedRef.current,
            solveMark,
            updatedAt: Date.now(),
          }));
        }
        setSubmitting(false);
      }, SOLVED_FLASH_MS);
    } catch {
      if (generation !== generationRef.current) return;
      setNotice("networkError");
      beginReturn(0, currentSlots, currentPresentIds);
    }
  }, [beginReturn, dateKey, elapsedRef, hintPendingRef, hintsUsedRef, mode, reloadAfterDesync, requestBody, schedule, setClue, setDailyUpdatedAt, setHintPending, setJustWon, setNotice, setSettlingFinalPick, setShake, setSlots, setSolved, setSolvedPicks, setSolveMarksMs, setSolving, setStats, setStatus, setSubmitting, setWordHints]);

  const pick = useCallback((tileId: number) => {
    if (
      status !== "playing" ||
      submitting ||
      settlingFinalPick ||
      pendingReturnRef.current
    ) return;
    if (slots.length >= WORD_LENGTH) return;
    if (!exposedTileIds(tiles, presentIds).has(tileId)) return;

    const tile = tiles[tileId];
    if (!tile) return;
    playKey();
    const nextPresentIds = presentIds.filter((id) => id !== tileId);
    const nextSlots = [...slots, { tileId, letter: tile.letter }];
    setPresentIds(nextPresentIds);
    setSlots(nextSlots);
    if (nextSlots.length !== WORD_LENGTH) return;

    setSettlingFinalPick(true);
    schedule(() => {
      void submitWord(nextSlots, nextPresentIds);
    }, finalPickSubmitDelay(prefersReducedMotion()));
  }, [presentIds, schedule, setPresentIds, setSettlingFinalPick, setSlots, settlingFinalPick, slots, status, submitWord, submitting, tiles]);

  const unpick = useCallback((slotIndex: number) => {
    if (
      status !== "playing" ||
      submitting ||
      settlingFinalPick ||
      pendingReturnRef.current
    ) return;
    if (slotIndex < 0 || slotIndex >= slots.length) return;
    playKey();
    beginReturn(slotIndex, slots, presentIds);
  }, [beginReturn, presentIds, settlingFinalPick, slots, status, submitting]);

  const useHint = useCallback(async () => {
    if (
      status !== "playing" ||
      submitting ||
      settlingFinalPick ||
      hintPendingRef.current
    ) return;
    if (solvedCountRef.current >= WORDS_PER_PUZZLE || clueRef.current !== null) return;

    const generation = generationRef.current;
    const requestSolvedCount = solvedCountRef.current;
    hintPendingRef.current = true;
    setHintPending(true);
    try {
      const response = await fetch("/api/stackdown", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...requestBody(), action: "hint" }),
      });
      if (generation !== generationRef.current) return;
      if (response.status === 409) {
        reloadAfterDesync();
        return;
      }
      if (!response.ok) throw new Error(`hint failed: ${response.status}`);
      const data = (await response.json()) as StackdownHintResponse;
      if (
        statusRef.current === "playing" &&
        solvedCountRef.current === requestSolvedCount &&
        clueRef.current === null
      ) {
        setClue(data.clue);
        setHintsUsed((previous) => previous + 1);
        if (mode === "daily") setDailyUpdatedAt(Date.now());
      }
    } catch {
      if (generation === generationRef.current) setNotice("networkError");
    } finally {
      if (generation === generationRef.current) {
        hintPendingRef.current = false;
        setHintPending(false);
      }
    }
  }, [clueRef, hintPendingRef, mode, reloadAfterDesync, requestBody, setClue, setDailyUpdatedAt, setHintPending, setHintsUsed, setNotice, settlingFinalPick, solvedCountRef, status, statusRef, submitting]);

  return {
    pendingReturnRef,
    pick,
    unpick,
    useHint,
    completeReturn,
    cancelRoundAnimations,
  };
}
