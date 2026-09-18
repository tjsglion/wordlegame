"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { vibrateInvalid, vibrateSolved, vibrateWin } from "@/lib/game/haptics";
import { playInvalid, playSolved, playTap, playWin } from "@/lib/game/sound";
import { loadGameData, saveGameData } from "@/lib/game/storage";
import { pickHintTarget, submitPath } from "./engine";
import { WORDPLAY_LEVELS } from "./levels";
import { isAdjacent, pointKey, type Point } from "./shared";
import type { WordplayProgressPayload } from "./sync-types";

export const LEVEL_COUNT = WORDPLAY_LEVELS.length;
export const STARTING_COINS = 30;
export const HINT_COST = 25;
export const BONUS_COINS = 2;
export const LEVEL_COINS = 10;

const SLUG = "wordplay";
const STORAGE_KEY = "progress";
const SYNC_API = "/api/wordplay/progress";

export type WordplayInteractionMode = "idle" | "dragging" | "clicking";

export interface WordplayPointerState {
  mode: WordplayInteractionMode;
  path: Point[];
}

type WordplayPointerEvent =
  | { kind: "down"; point: Point }
  | { kind: "move"; point: Point; buttons: number }
  | { kind: "up" };

const IDLE_POINTER: WordplayPointerState = { mode: "idle", path: [] };

interface StoredProgress extends WordplayProgressPayload {
  /** In-progress level snapshot, kept locally only (never synced). */
  active?: { level: number; targets: string[]; bonus: string[] };
}

interface WordplayRefs {
  levelIndex: number;
  foundTargets: string[];
  foundBonus: string[];
  coins: number;
  currentLevel: number;
  completed: WordplayProgressPayload["completed"];
  pointer: WordplayPointerState;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isSamePoint(first: Point, second: Point) {
  return pointKey(first) === pointKey(second);
}

function canAppend(path: Point[], point: Point) {
  const last = path[path.length - 1];
  return (
    !path.some((item) => isSamePoint(item, point)) &&
    Boolean(last && isAdjacent(last, point))
  );
}

/** Pure pointer/click state machine, adapted from Strands minus cell locking. */
export function transitionWordplayPointer(
  state: WordplayPointerState,
  event: WordplayPointerEvent,
): { state: WordplayPointerState; submitPath: Point[] | null } {
  if (event.kind === "up") {
    if (state.mode !== "dragging") return { state, submitPath: null };
    return state.path.length === 1
      ? { state: { mode: "clicking", path: state.path }, submitPath: null }
      : { state: IDLE_POINTER, submitPath: state.path };
  }
  if (event.kind === "move") {
    if (state.mode === "idle" || event.buttons === 0) {
      return { state, submitPath: null };
    }
    const penultimate = state.path[state.path.length - 2];
    if (penultimate && isSamePoint(penultimate, event.point)) {
      return { state: { mode: "dragging", path: state.path.slice(0, -1) }, submitPath: null };
    }
    if (!canAppend(state.path, event.point)) return { state, submitPath: null };
    return { state: { mode: "dragging", path: [...state.path, event.point] }, submitPath: null };
  }
  if (state.mode === "idle") return { state: { mode: "dragging", path: [event.point] }, submitPath: null };
  if (state.mode === "dragging") return { state: { mode: "dragging", path: [event.point] }, submitPath: null };

  const endpoint = state.path[state.path.length - 1];
  const penultimate = state.path[state.path.length - 2];
  if (endpoint && isSamePoint(endpoint, event.point) && state.path.length > 1) {
    return { state: IDLE_POINTER, submitPath: state.path };
  }
  if (penultimate && isSamePoint(penultimate, event.point)) {
    return { state: { mode: "clicking", path: state.path.slice(0, -1) }, submitPath: null };
  }
  if (canAppend(state.path, event.point)) {
    return { state: { mode: "clicking", path: [...state.path, event.point] }, submitPath: null };
  }
  return { state: { mode: "dragging", path: [event.point] }, submitPath: null };
}

function sameCompleted(
  first: WordplayProgressPayload["completed"],
  second: WordplayProgressPayload["completed"],
) {
  const firstKeys = Object.keys(first);
  return (
    firstKeys.length === Object.keys(second).length &&
    firstKeys.every((key) => first[key]?.bonus === second[key]?.bonus)
  );
}

function loadBootState() {
  const stored = loadGameData<StoredProgress>(SLUG, STORAGE_KEY, {
    currentLevel: 1,
    coins: STARTING_COINS,
    completed: {},
  });
  const currentLevel = clamp(Math.floor(stored.currentLevel) || 1, 1, LEVEL_COUNT + 1);
  const coins = Number.isFinite(stored.coins)
    ? Math.max(0, Math.floor(stored.coins))
    : STARTING_COINS;
  const completed =
    typeof stored.completed === "object" && stored.completed !== null
      ? stored.completed
      : {};
  const levelIndex = clamp(currentLevel, 1, LEVEL_COUNT) - 1;
  const level = WORDPLAY_LEVELS[levelIndex];
  const active = stored.active && stored.active.level === levelIndex ? stored.active : null;
  return {
    levelIndex,
    foundTargets: active?.targets.filter((word) => level.targets.includes(word)) ?? [],
    foundBonus: active?.bonus.filter((word) => level.bonus.includes(word)) ?? [],
    currentLevel,
    coins,
    completed,
  };
}

export function useWordplay(isAuthenticated = false) {
  const t = useTranslations("Wordplay");
  // Games render client-only (next/dynamic ssr:false), so reading localStorage
  // in the initializer is safe and avoids a post-mount state flash.
  const [boot] = useState(loadBootState);
  const [levelIndex, setLevelIndex] = useState(boot.levelIndex);
  const [foundTargets, setFoundTargets] = useState<string[]>(boot.foundTargets);
  const [foundBonus, setFoundBonus] = useState<string[]>(boot.foundBonus);
  const [coins, setCoins] = useState(boot.coins);
  const [currentLevel, setCurrentLevel] = useState(boot.currentLevel);
  const [completed, setCompleted] = useState(boot.completed);
  const [pointer, setPointer] = useState<WordplayPointerState>(IDLE_POINTER);
  const [errorPath, setErrorPath] = useState<Point[]>([]);
  const [hintCell, setHintCell] = useState<Point | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [completeSummary, setCompleteSummary] = useState<{
    level: number;
    bonusCount: number;
  } | null>(null);

  const level = WORDPLAY_LEVELS[levelIndex];
  const isLevelComplete = foundTargets.length === level.targets.length;

  const refs = useRef<WordplayRefs>({
    levelIndex,
    foundTargets,
    foundBonus,
    coins,
    currentLevel,
    completed,
    pointer,
  });
  useEffect(() => {
    refs.current = { levelIndex, foundTargets, foundBonus, coins, currentLevel, completed, pointer };
  });

  const commit = useCallback(<K extends keyof WordplayRefs>(key: K, value: WordplayRefs[K]) => {
    const setters = {
      levelIndex: setLevelIndex,
      foundTargets: setFoundTargets,
      foundBonus: setFoundBonus,
      coins: setCoins,
      currentLevel: setCurrentLevel,
      completed: setCompleted,
      pointer: setPointer,
    } as const;
    refs.current[key] = value;
    (setters[key] as (next: WordplayRefs[K]) => void)(value);
  }, []);

  const timers = useRef(new Map<string, number>());
  const schedule = useCallback((key: string, callback: () => void, delay: number) => {
    const previous = timers.current.get(key);
    if (previous !== undefined) window.clearTimeout(previous);
    const id = window.setTimeout(() => {
      timers.current.delete(key);
      callback();
    }, delay);
    timers.current.set(key, id);
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  useEffect(() => {
    saveGameData(SLUG, STORAGE_KEY, {
      currentLevel,
      coins,
      completed,
      active: { level: levelIndex, targets: foundTargets, bonus: foundBonus },
    } satisfies StoredProgress);
  }, [levelIndex, foundTargets, foundBonus, coins, currentLevel, completed]);

  const showFeedback = useCallback(
    (path: Point[], text: string) => {
      setErrorPath(path);
      setMessage(text);
      schedule("error", () => setErrorPath([]), 600);
      schedule("message", () => setMessage(null), 2000);
    },
    [schedule],
  );

  const completeLevel = useCallback(() => {
    const current = refs.current;
    const levelNumber = current.levelIndex + 1;
    playWin();
    vibrateWin();
    const bonusCount = current.foundBonus.length;
    const previous = current.completed[String(levelNumber)];
    commit("completed", {
      ...current.completed,
      [String(levelNumber)]: { bonus: Math.max(bonusCount, previous?.bonus ?? 0) },
    });
    commit("coins", current.coins + LEVEL_COINS);
    commit(
      "currentLevel",
      Math.max(current.currentLevel, Math.min(levelNumber + 1, LEVEL_COUNT + 1)),
    );
    setJustCompleted(true);
    setCompleteSummary({ level: levelNumber, bonusCount });
  }, [commit]);

  const submit = useCallback(
    (path = refs.current.pointer.path) => {
      const current = refs.current;
      const levelData = WORDPLAY_LEVELS[current.levelIndex];
      if (current.foundTargets.length === levelData.targets.length || path.length === 0) return;
      commit("pointer", IDLE_POINTER);
      const result = submitPath(
        levelData,
        path,
        new Set(current.foundTargets),
        new Set(current.foundBonus),
      );
      if (result.kind === "target") {
        playSolved();
        vibrateSolved();
        commit("foundTargets", [...current.foundTargets, result.word]);
        if (result.isLevelComplete) completeLevel();
        return;
      }
      if (result.kind === "bonus") {
        playTap();
        commit("foundBonus", [...current.foundBonus, result.word]);
        commit("coins", current.coins + BONUS_COINS);
        showFeedback([], t("feedback.bonus", { coins: BONUS_COINS }));
        return;
      }
      playInvalid();
      vibrateInvalid();
      const text =
        result.kind === "already-found"
          ? t("feedback.alreadyFound")
          : result.kind === "too-short"
            ? t("feedback.tooShort")
            : t("feedback.unknown");
      showFeedback(result.errorPath, text);
    },
    [commit, completeLevel, showFeedback, t],
  );

  const transition = useCallback(
    (event: WordplayPointerEvent) => {
      const current = refs.current;
      const levelData = WORDPLAY_LEVELS[current.levelIndex];
      if (current.foundTargets.length === levelData.targets.length) return;
      const next = transitionWordplayPointer(current.pointer, event);
      if (next.state !== current.pointer) commit("pointer", next.state);
      if (next.submitPath) submit(next.submitPath);
    },
    [commit, submit],
  );

  const pointerDown = useCallback((point: Point) => transition({ kind: "down", point }), [transition]);
  const pointerMove = useCallback(
    (point: Point, buttons: number) => transition({ kind: "move", point, buttons }),
    [transition],
  );
  const pointerUp = useCallback(() => transition({ kind: "up" }), [transition]);

  const useHint = useCallback(() => {
    const current = refs.current;
    const levelData = WORDPLAY_LEVELS[current.levelIndex];
    if (current.foundTargets.length === levelData.targets.length) return;
    if (current.coins < HINT_COST) {
      showFeedback([], t("feedback.noHint"));
      return;
    }
    const hint = pickHintTarget(levelData, new Set(current.foundTargets));
    if (!hint) {
      showFeedback([], t("feedback.noHint"));
      return;
    }
    playTap();
    commit("coins", current.coins - HINT_COST);
    setHintCell(hint.start);
    schedule("hint", () => setHintCell(null), 2200);
  }, [commit, schedule, showFeedback, t]);

  const loadLevel = useCallback(
    (index: number) => {
      commit("levelIndex", index);
      commit("foundTargets", []);
      commit("foundBonus", []);
      commit("pointer", IDLE_POINTER);
      setErrorPath([]);
      setHintCell(null);
      setMessage(null);
      setJustCompleted(false);
      setCompleteSummary(null);
    },
    [commit],
  );

  const selectLevel = useCallback(
    (index: number) => {
      if (index < 0 || index >= LEVEL_COUNT) return;
      if (index + 1 > refs.current.currentLevel) return;
      if (index !== refs.current.levelIndex) loadLevel(index);
    },
    [loadLevel],
  );

  const nextLevel = useCallback(
    () => selectLevel(refs.current.levelIndex + 1),
    [selectLevel],
  );
  const replayLevel = useCallback(() => loadLevel(refs.current.levelIndex), [loadLevel]);

  // Server sync for signed-in users: merge once on mount (higher level wins,
  // coins take max, completed is a union), then debounce-push local changes.
  const hasInitialSync = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(SYNC_API);
        if (!res.ok) return;
        const remote = (await res.json()) as WordplayProgressPayload;
        if (cancelled) return;
        const current = refs.current;
        const mergedCompleted: WordplayProgressPayload["completed"] = {
          ...remote.completed,
        };
        for (const [key, entry] of Object.entries(current.completed)) {
          const existing = mergedCompleted[key];
          if (!existing || entry.bonus > existing.bonus) mergedCompleted[key] = entry;
        }
        const mergedLevel = clamp(
          Math.max(current.currentLevel, Math.floor(remote.currentLevel) || 1),
          1,
          LEVEL_COUNT + 1,
        );
        const mergedCoins = Math.max(
          current.coins,
          Number.isFinite(remote.coins) ? Math.floor(remote.coins) : 0,
        );
        if (mergedLevel !== current.currentLevel) commit("currentLevel", mergedLevel);
        if (mergedCoins !== current.coins) commit("coins", mergedCoins);
        if (!sameCompleted(mergedCompleted, current.completed)) {
          commit("completed", mergedCompleted);
        }
      } catch {
        // Offline: local progress keeps working and syncs on the next visit.
      } finally {
        if (!cancelled) hasInitialSync.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, commit]);

  useEffect(() => {
    if (!isAuthenticated || !hasInitialSync.current) return;
    const timeoutId = window.setTimeout(() => {
      const { currentLevel: level, coins: balance, completed: done } = refs.current;
      void fetch(SYNC_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLevel: level,
          coins: balance,
          completed: done,
        } satisfies WordplayProgressPayload),
      }).catch(() => {});
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, currentLevel, coins, completed]);

  const state = useMemo(
    () => ({
      levelIndex,
      levelNumber: levelIndex + 1,
      level,
      foundTargets,
      foundBonus,
      coins,
      currentLevel,
      completed,
      path: pointer.path,
      errorPath,
      hintCell,
      message,
      isLevelComplete,
      justCompleted,
      completeSummary,
      canHint: coins >= HINT_COST && !isLevelComplete,
    }),
    [
      levelIndex,
      level,
      foundTargets,
      foundBonus,
      coins,
      currentLevel,
      completed,
      pointer,
      errorPath,
      hintCell,
      message,
      isLevelComplete,
      justCompleted,
      completeSummary,
    ],
  );

  return {
    state,
    pointerDown,
    pointerMove,
    pointerUp,
    submit,
    useHint,
    selectLevel,
    nextLevel,
    replayLevel,
  };
}
