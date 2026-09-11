"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadGameData, saveGameData } from "@/lib/game/storage";
import { playInvalid, playKey, playSolved, playWin } from "@/lib/game/sound";
import { vibrateSolved } from "@/lib/game/haptics";
import {
  MAX_HINTS_PER_WORD,
  WORD_LENGTH,
  WORDS_PER_PUZZLE,
  overlaps,
  stackdownStars,
  type GameMode,
  type StackdownGuessResponse,
  type StackdownHintResponse,
  type StackdownStartResponse,
  type StackdownTile,
} from "./shared";
import {
  emptyStackdownStats,
  normalizeStackdownDailyState,
  normalizeStackdownStats,
  STACKDOWN_SLUG,
  stackdownStatsKey,
  type StackdownDailyState,
  type StackdownStats,
  type StackdownSyncRequest,
  type StackdownSyncResponse,
  type StackdownWordTime,
} from "./persistence";

export type { GameMode } from "./shared";
export type { StackdownStats } from "./persistence";
export type StackdownStatus = "loading" | "error" | "playing" | "won";
export type NoticeKey = "invalidWord" | "networkError";

/** How long a solved word stays in the slots for the success bounce. */
const SOLVED_FLASH_MS = 650;

const SLUG = STACKDOWN_SLUG;
const DAILY_KEY = "daily-v3";
/** Pre-per-mode stats key, migrated into `stats-daily` on first load. */
const LEGACY_STATS_KEY = "stats";
const SYNC_API = "/api/stackdown/sync";

export interface BoardTile extends StackdownTile {
  id: number;
}

export interface SlotTile {
  tileId: number;
  letter: string;
}

interface PersistedDaily {
  dateKey: string;
  tiles: StackdownTile[];
  presentIds: number[];
  slots: SlotTile[];
  solved: string[];
  /** Tile ids per solved word, in solve order (absent in pre-sync saves). */
  solvedPicks?: number[][];
  hintsUsed: number;
  /** Hints per solved word (absent in pre-sync saves). */
  wordHints?: number[];
  /** Clue text revealed by the hint for the current word (null until used). */
  clue: string | null;
  elapsedMs: number;
  solveMarksMs: number[];
  status: "playing" | "won";
  updatedAt?: number;
}

function previousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Load per-mode stats from localStorage. Daily falls back to the legacy
 * pre-per-mode `stats` key once, migrating whatever it finds there.
 */
export function loadStackdownStats(mode: GameMode): StackdownStats {
  const key = stackdownStatsKey(mode);
  const saved = loadGameData<StackdownStats | null>(SLUG, key, null);
  if (saved) return normalizeStackdownStats(saved);
  if (mode === "daily") {
    const legacy = loadGameData<StackdownStats | null>(SLUG, LEGACY_STATS_KEY, null);
    if (legacy) return normalizeStackdownStats(legacy);
  }
  return emptyStackdownStats();
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Ids of tiles with no remaining tile overlapping them from above. */
function exposedIds(tiles: BoardTile[], presentIds: number[]): Set<number> {
  const present = new Set(presentIds);
  const exposed = new Set<number>();
  for (const id of present) {
    const tile = tiles[id];
    let covered = false;
    for (const otherId of present) {
      if (otherId !== id && overlaps(tiles[otherId], tile)) {
        covered = true;
        break;
      }
    }
    if (!covered) exposed.add(id);
  }
  return exposed;
}

/**
 * Pre-sync saves lack per-word picks/hints; rebuild them from the remaining
 * pile so a mid-game round can still be synced. If a pick row can't be
 * reconstructed the server-side replay will simply reject it.
 */
function reconstructProgress(saved: PersistedDaily): {
  picks: number[][];
  wordHints: number[];
} {
  const pool = saved.tiles
    .map((_, id) => id)
    .filter(
      (id) =>
        !saved.presentIds.includes(id) &&
        !saved.slots.some((slot) => slot.tileId === id),
    );
  const picks: number[][] = [];
  for (const word of saved.solved) {
    const row: number[] = [];
    for (const letter of word) {
      const id = pool.find(
        (candidate) =>
          !row.includes(candidate) && saved.tiles[candidate]?.letter === letter,
      );
      if (id === undefined) break;
      row.push(id);
    }
    if (row.length !== WORD_LENGTH) break;
    picks.push(row);
  }

  let hintsLeft = saved.hintsUsed;
  const wordHints = saved.solved.map(() => {
    const hints = Math.min(hintsLeft, MAX_HINTS_PER_WORD);
    hintsLeft -= hints;
    return hints;
  });
  return { picks, wordHints };
}

function sameStatsContent(left: StackdownStats, right: StackdownStats): boolean {
  return (
    left.wins === right.wins &&
    left.currentStreak === right.currentStreak &&
    left.maxStreak === right.maxStreak &&
    left.bestTimeMs === right.bestTimeMs &&
    left.distribution.every((count, index) => count === right.distribution[index])
  );
}

/**
 * Progress-only projection for change detection: timings tick continuously,
 * so only solved picks, status, and hints decide whether a state moved on.
 */
function dailyProjection(
  state: Pick<
    StackdownDailyState,
    "dateKey" | "picks" | "status" | "wordTimes"
  > | null,
): string | null {
  if (!state) return null;
  return JSON.stringify({
    d: state.dateKey,
    p: state.picks,
    s: state.status,
    h: state.wordTimes.map((word) => word.hints),
  });
}

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

export function useStackdown(mode: GameMode, isAuthenticated = false) {
  const [status, setStatus] = useState<StackdownStatus>("loading");
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tiles, setTiles] = useState<BoardTile[]>([]);
  const [presentIds, setPresentIds] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotTile[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  /** Tile ids per solved word, in solve order — the sync payload's picks. */
  const [solvedPicks, setSolvedPicks] = useState<number[][]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  /** Hints spent on each solved word, in solve order. */
  const [wordHints, setWordHints] = useState<number[]>([]);
  /** Clue text revealed by the hint for the current word. */
  const [clue, setClue] = useState<string | null>(null);
  const [hintPending, setHintPending] = useState(false);
  const [notice, setNotice] = useState<NoticeKey | null>(null);
  const [shake, setShake] = useState(false);
  /** True while a solved word is playing its success bounce in the slots. */
  const [solving, setSolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const [solveMarksMs, setSolveMarksMs] = useState<number[]>([]);
  const [stats, setStats] = useState<StackdownStats>(emptyStackdownStats);
  const [dailyUpdatedAt, setDailyUpdatedAt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // --- Timer: runs while playing and the page is visible. ---
  // elapsedRef is the source of truth (mutable, used by handlers and the
  // persistence effect); elapsedMs is the display value ticked once a second.
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hidden, setHidden] = useState(false);
  const elapsedRef = useRef(0);

  // Refs mirror the pieces of state that sync snapshots/applications read,
  // so those callbacks stay stable instead of chasing every state change.
  const hasInitialSync = useRef(false);
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
    stats,
    tiles,
    dateKey,
    status,
    solvedPicks,
    solveMarksMs,
    wordHints,
    hintsUsed,
    dailyUpdatedAt,
    solved.length,
    clue,
    hintPending,
  ]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const timerActive = status === "playing" && !hidden;
  useEffect(() => {
    if (!timerActive) return;
    // Accumulate deltas into elapsedRef instead of computing from a fixed
    // baseline, so an externally-updated elapsed (e.g. a sync apply landing
    // mid-play) is respected instead of clobbered on the next tick.
    let last = Date.now();
    const accumulate = () => {
      const now = Date.now();
      elapsedRef.current += Math.max(0, now - last);
      last = now;
      setElapsedMs(elapsedRef.current);
    };
    const id = window.setInterval(accumulate, 1000);
    return () => {
      window.clearInterval(id);
      accumulate();
    };
  }, [timerActive]);

  // --- Round loading ---
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
      hintPendingRef.current = false;
      setHintPending(false);
      elapsedRef.current = 0;
      setElapsedMs(0);
      setSolveMarksMs([]);
      setDailyUpdatedAt(0);
      setStatus("playing");
    };

    async function load() {
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
            hintPendingRef.current = false;
            setHintPending(false);
            elapsedRef.current = saved.elapsedMs;
            setElapsedMs(saved.elapsedMs);
            setSolveMarksMs(saved.solveMarksMs);
            setDailyUpdatedAt(saved.updatedAt ?? 0);
            setStatus(saved.status);
          } else {
            applyFresh(payload);
          }
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
  }, [mode, reloadTick]);

  // --- Daily persistence (practice rounds are throwaway). ---
  useEffect(() => {
    if (!loaded || mode !== "daily" || !dateKey) return;
    if (status !== "playing" && status !== "won") return;
    const snapshot: PersistedDaily = {
      dateKey,
      tiles,
      presentIds,
      slots,
      solved,
      solvedPicks,
      hintsUsed,
      wordHints,
      clue,
      elapsedMs: elapsedRef.current,
      solveMarksMs,
      status,
      updatedAt: dailyUpdatedAt,
    };
    saveGameData(SLUG, DAILY_KEY, snapshot);
  }, [
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
  ]);

  // Stats persist per mode on change; the initial load seeds them first.
  useEffect(() => {
    if (!loaded) return;
    saveGameData(SLUG, stackdownStatsKey(mode), stats);
  }, [loaded, mode, stats]);

  // --- Cloud sync (signed-in users only; fails silently offline). ---
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
  }, [mode]);

  /** Restore a server-merged daily round onto the loaded board. */
  const applySyncedDaily = useCallback((state: StackdownDailyState) => {
    const boardTiles = tilesRef.current;
    if (boardTiles.length === 0) return;
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
    hintPendingRef.current = false;
    setHintPending(false);
    let mark = 0;
    setSolveMarksMs(
      state.wordTimes.map((word) => (mark += Math.max(0, word.timeMs))),
    );
    elapsedRef.current = state.elapsedMs;
    setElapsedMs(state.elapsedMs);
    setDailyUpdatedAt(state.updatedAt);
    setStatus(state.status);
  }, []);

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
      ) {
        // lastDailyWin is local-only — never let a sync clear it.
        setStats({
          ...nextStats,
          lastDailyWin: nextStats.lastDailyWin ?? statsRef.current.lastDailyWin,
        });
      }

      if (mode !== "daily") return;
      const nextDailyState = normalizeStackdownDailyState(response.dailyState);
      if (!nextDailyState || nextDailyState.dateKey !== dateKeyRef.current) {
        return;
      }

      // Apply the merged round only while the local board hasn't moved on
      // since the request snapshot was taken.
      const localStateNow = snapshotDailyState();
      if (
        dailyProjection(localStateNow) === dailyProjection(requestDailyState) &&
        dailyProjection(localStateNow) !== dailyProjection(nextDailyState)
      ) {
        applySyncedDaily(nextDailyState);
      }
    },
    [mode, applySyncedDaily, snapshotDailyState],
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
    applySyncResponse,
    isAuthenticated,
    loaded,
    mode,
    snapshotDailyState,
  ]);

  // Initial sync: pull the merged cloud state once the round has loaded.
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
      // Only an authenticated response counts: a mid-session login must be
      // able to retrigger this effect and get its initial sync.
      hasInitialSync.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [applySyncResponse, isAuthenticated, loaded, mode, snapshotDailyState]);

  // Debounced push of in-progress progress (mirrors Wordle): after the
  // initial sync, meaningful state changes reach the cloud within ~400ms
  // even if the tab dies without a visibilitychange. Timings are excluded
  // from the deps — they tick every second and aren't sync-worthy alone.
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
    snapshotDailyState,
  ]);

  // Flush as soon as a round is won so the result reaches the leaderboard.
  useEffect(() => {
    if (status !== "won") return;
    void flushSync();
  }, [status, flushSync]);

  // Save on tab hide: elapsed time lives in a ref, so the state-driven
  // effect above would otherwise persist a stale value. Also flush to the
  // cloud — this is the last reliable moment before the tab freezes.
  useEffect(() => {
    if (!loaded || mode !== "daily" || !dateKey) return;
    if (status !== "playing" && status !== "won") return;
    const saveOnHide = () => {
      if (!document.hidden) return;
      const snapshot: PersistedDaily = {
        dateKey,
        tiles,
        presentIds,
        slots,
        solved,
        solvedPicks,
        hintsUsed,
        wordHints,
        clue,
        elapsedMs: elapsedRef.current,
        solveMarksMs,
        status,
        updatedAt: dailyUpdatedAt,
      };
      saveGameData(SLUG, DAILY_KEY, snapshot);
      void flushSync();
    };
    document.addEventListener("visibilitychange", saveOnHide);
    return () => document.removeEventListener("visibilitychange", saveOnHide);
  }, [
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
    flushSync,
  ]);

  // --- Notices self-clear. ---
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 1600);
    return () => window.clearTimeout(id);
  }, [notice]);

  const requestBody = useCallback(
    () => ({ mode, ...(mode === "practice" ? { token } : {}), solved }),
    [mode, token, solved],
  );

  /** Return slot tiles from `fromIndex` onward to the stack. */
  const returnSlots = useCallback(
    (fromIndex: number, currentSlots: SlotTile[], currentPresent: number[]) => {
      const returning = currentSlots.slice(fromIndex).map((slot) => slot.tileId);
      setPresentIds([...currentPresent, ...returning]);
      setSlots(currentSlots.slice(0, fromIndex));
    },
    [],
  );

  const submitWord = useCallback(
    async (currentSlots: SlotTile[], currentPresent: number[]) => {
      const word = currentSlots.map((slot) => slot.letter).join("");
      setSubmitting(true);
      try {
        const res = await fetch("/api/stackdown", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...requestBody(),
            action: "guess",
            tiles: currentSlots.map((slot) => slot.tileId),
          }),
        });
        if (res.status === 409) {
          // Local state drifted from the server puzzle — reload the round.
          if (mode === "daily") saveGameData(SLUG, DAILY_KEY, null);
          setReloadTick((tick) => tick + 1);
          return;
        }
        if (!res.ok) throw new Error(`guess failed: ${res.status}`);
        const data = (await res.json()) as StackdownGuessResponse;

        if (data.ok) {
          playSolved();
          vibrateSolved();
          // Capture the solve time now — the flash below delays banking, and
          // the word's time should not include its own celebration.
          const solveMark = elapsedRef.current;
          // Hold the completed word in the slots for the success bounce, then
          // bank it. `submitting` stays true throughout so picks/hints wait.
          setSolving(true);
          window.setTimeout(() => {
            setSolving(false);
            setSlots([]);
            setSolved((previous) => [...previous, word]);
            setSolvedPicks((previous) => [
              ...previous,
              currentSlots.map((slot) => slot.tileId),
            ]);
            setSolveMarksMs((previous) => [...previous, solveMark]);
            // Hints spent on the just-solved word = total minus earlier words.
            setWordHints((previous) => [
              ...previous,
              hintsUsedRef.current -
                previous.reduce((sum, hints) => sum + hints, 0),
            ]);
            setClue(null);
              hintPendingRef.current = false;
              setHintPending(false);
            if (mode === "daily") setDailyUpdatedAt(Date.now());
            if (data.finished) {
              setStatus("won");
              setJustWon(true);
              playWin();
              // Stats are tracked per mode (like Wordle). Daily streaks follow
              // lastDailyWin dates; practice streaks simply chain wins.
              const stars = stackdownStars(hintsUsedRef.current);
              setStats((previous) => {
                const key = dateKey ?? "";
                const currentStreak =
                  mode === "daily"
                    ? previous.lastDailyWin === previousDateKey(key)
                      ? previous.currentStreak + 1
                      : 1
                    : previous.currentStreak + 1;
                const next: StackdownStats = {
                  wins: previous.wins + 1,
                  currentStreak,
                  maxStreak: Math.max(previous.maxStreak, currentStreak),
                  bestTimeMs:
                    previous.bestTimeMs === null
                      ? solveMark
                      : Math.min(previous.bestTimeMs, solveMark),
                  lastDailyWin: mode === "daily" ? key : previous.lastDailyWin,
                  distribution: previous.distribution.map((count, index) =>
                    index === stars - 1 ? count + 1 : count,
                  ),
                  updatedAt: Date.now(),
                };
                return next;
              });
            }
            setSubmitting(false);
          }, SOLVED_FLASH_MS);
        } else {
          playInvalid();
          setNotice("invalidWord");
          setShake(true);
          window.setTimeout(() => setShake(false), 500);
          returnSlots(0, currentSlots, currentPresent);
          setSubmitting(false);
        }
      } catch {
        setNotice("networkError");
        returnSlots(0, currentSlots, currentPresent);
        setSubmitting(false);
      }
    },
    [requestBody, mode, dateKey, returnSlots],
  );

  const exposed = useMemo(() => exposedIds(tiles, presentIds), [tiles, presentIds]);

  const pick = useCallback(
    (tileId: number) => {
      if (status !== "playing" || submitting) return;
      if (slots.length >= WORD_LENGTH) return;
      if (!exposed.has(tileId)) return;

      playKey();
      const nextPresent = presentIds.filter((id) => id !== tileId);
      const nextSlots = [
        ...slots,
        { tileId, letter: tiles[tileId].letter },
      ];
      setPresentIds(nextPresent);
      setSlots(nextSlots);
      if (nextSlots.length === WORD_LENGTH) {
        void submitWord(nextSlots, nextPresent);
      }
    },
    [status, submitting, slots, presentIds, tiles, exposed, submitWord],
  );

  const unpick = useCallback(
    (slotIndex: number) => {
      if (status !== "playing" || submitting) return;
      if (slotIndex < 0 || slotIndex >= slots.length) return;
      playKey();
      returnSlots(slotIndex, slots, presentIds);
    },
    [status, submitting, slots, presentIds, returnSlots],
  );

  const useHint = useCallback(async () => {
    if (status !== "playing" || submitting || hintPendingRef.current) return;
    if (solvedCountRef.current >= WORDS_PER_PUZZLE) return;
    // One clue per word; once it's shown the slider is spent.
    if (clueRef.current !== null) return;
    const requestSolvedCount = solvedCountRef.current;
    hintPendingRef.current = true;
    setHintPending(true);
    try {
      const res = await fetch("/api/stackdown", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...requestBody(),
          action: "hint",
        }),
      });
      if (res.status === 409) {
        // Local state drifted from the server puzzle — reload the round.
        if (mode === "daily") saveGameData(SLUG, DAILY_KEY, null);
        setReloadTick((tick) => tick + 1);
        return;
      }
      if (!res.ok) throw new Error(`hint failed: ${res.status}`);
      const data = (await res.json()) as StackdownHintResponse;
      if (
        statusRef.current !== "playing" ||
        solvedCountRef.current !== requestSolvedCount ||
        clueRef.current !== null
      ) {
        return;
      }
      setClue(data.clue);
      setHintsUsed((previous) => previous + 1);
      if (mode === "daily") setDailyUpdatedAt(Date.now());
    } catch {
      setNotice("networkError");
    } finally {
      hintPendingRef.current = false;
      setHintPending(false);
    }
  }, [status, submitting, requestBody, mode]);

  /** Per-word durations derived from the elapsed marks at each solve. */
  const wordTimesMs = useMemo(
    () =>
      solveMarksMs.map(
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
    lastSolved: solved.length > 0 ? solved[solved.length - 1] : null,
    hintsUsed,
    clue,
    notice,
    shake,
    solving,
    submitting,
    hintPending,
    justWon,
    elapsedMs,
    wordTimesMs,
    stats,
    totalWords: WORDS_PER_PUZZLE,
    pick,
    unpick,
    useHint,
    flushSync,
    retry: () => setReloadTick((tick) => tick + 1),
  };
}
