"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { todayKey } from "@/lib/game/daily";
import { vibrateInvalid, vibrateKey, vibrateWin } from "@/lib/game/haptics";
import {
  playInvalid,
  playKey,
  playLose,
  playTap,
  playWin,
} from "@/lib/game/sound";
import { loadGameData, saveGameData } from "@/lib/game/storage";
import {
  LETTER_STATE_PRIORITY,
  REVEAL_MS,
  WORD_LENGTH,
  type GameMode,
  type GameStatus,
  type GuessRequest,
  type GuessResponse,
  type LetterState,
} from "./shared";
import {
  emptyWordleStats,
  normalizeDailyState,
  normalizeWordleStats,
  WORDLE_SLUG,
  type DailyState,
  type WordleStats,
  type WordleSyncRequest,
  type WordleSyncResponse,
} from "./persistence";

export { MAX_GUESSES, WORD_LENGTH } from "./shared";
export type { GameMode, GameStatus, LetterState } from "./shared";

/** Translation keys under the `Wordle` namespace, surfaced as toast. */
export type NoticeKey =
  | "notEnoughLetters"
  | "notInWordList"
  | "networkError"
  | "winMessage"
  | "loseMessage";

const SLUG = WORDLE_SLUG;
const GUESS_API = "/api/daily-guess/guess";
const SYNC_API = "/api/daily-guess/sync";

type GuessErrorKind = "invalid" | "unauthorized" | "network";

class GuessApiError extends Error {
  constructor(public kind: GuessErrorKind) {
    super(kind);
  }
}

/** Server-authoritative evaluation; the answer never reaches the client. */
async function postGuess(body: GuessRequest): Promise<GuessResponse> {
  let res: Response;
  try {
    res = await fetch(GUESS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GuessApiError("network");
  }
  if (res.status === 401) throw new GuessApiError("unauthorized");
  if (res.status === 400) throw new GuessApiError("invalid");
  if (!res.ok) throw new GuessApiError("network");
  return res.json() as Promise<GuessResponse>;
}

/** Restore today's daily progress (same key date only), if any. */
function loadDailyState(): DailyState | null {
  const saved = normalizeDailyState(
    loadGameData<DailyState | null>(SLUG, "daily-state", null),
  );
  if (saved && saved.dateKey === todayKey()) return saved;
  return null;
}

function sameStringArray(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function sameResults(
  left: LetterState[][],
  right: LetterState[][],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (row, rowIndex) =>
        row.length === right[rowIndex]?.length &&
        row.every((value, columnIndex) => value === right[rowIndex]?.[columnIndex]),
    )
  );
}

function sameDailyStateContent(
  left: DailyState | null,
  right: DailyState | null,
): boolean {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return (
    left.dateKey === right.dateKey &&
    left.status === right.status &&
    left.answer === right.answer &&
    sameStringArray(left.guesses, right.guesses) &&
    sameResults(left.results, right.results)
  );
}

function sameStatsContent(left: WordleStats, right: WordleStats): boolean {
  return (
    left.played === right.played &&
    left.wins === right.wins &&
    left.currentStreak === right.currentStreak &&
    left.maxStreak === right.maxStreak &&
    sameStringArray(
      left.distribution.map(String),
      right.distribution.map(String),
    )
  );
}

async function postSync(
  body: WordleSyncRequest,
): Promise<WordleSyncResponse | null> {
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
  return res.json() as Promise<WordleSyncResponse>;
}

export function useWordle(mode: GameMode, isAuthenticated = false) {
  // Restore daily progress once per mount: a single loadDailyState() call
  // seeds guesses/results/status/answer (previously it ran twice).
  const [restored] = useState<DailyState | null>(() =>
    mode === "daily" ? loadDailyState() : null,
  );
  const [guesses, setGuesses] = useState<string[]>(restored?.guesses ?? []);
  const [results, setResults] = useState<LetterState[][]>(
    restored?.results ?? [],
  );
  const [status, setStatus] = useState<GameStatus>(
    restored?.status ?? "playing",
  );
  const [answer, setAnswer] = useState<string | null>(restored?.answer ?? null);
  const [dailyUpdatedAt, setDailyUpdatedAt] = useState<number>(
    restored?.updatedAt ?? 0,
  );
  const [current, setCurrent] = useState("");
  const [token, setToken] = useState<string | null>(null);
  // Practice mode needs a server-issued token before the first guess; daily
  // mode is ready immediately unless restored state predates server-side
  // results and needs re-evaluation.
  const needsRestore = Boolean(
    restored && restored.results.length !== restored.guesses.length,
  );
  const [ready, setReady] = useState(mode === "daily" && !needsRestore);
  const [revealing, setRevealing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [notice, setNotice] = useState<NoticeKey | null>(null);
  // True only when this session just won (not a restored "won" from
  // localStorage) — gates the win bounce and confetti so a refresh of a
  // finished daily round doesn't replay the celebration.
  const [justWon, setJustWon] = useState(false);
  // True while restored (re-evaluated) results are being applied post-mount —
  // the board suppresses the flip transition so a refresh doesn't replay it.
  const [skipFlipAnim, setSkipFlipAnim] = useState(false);
  const [stats, setStats] = useState<WordleStats>(() =>
    normalizeWordleStats(
      loadGameData<WordleStats>(SLUG, `stats-${mode}`, emptyWordleStats()),
    ),
  );
  const hasInitialSync = useRef(false);
  const guessesRef = useRef(guesses);
  const resultsRef = useRef(results);
  const statusRef = useRef(status);
  const answerRef = useRef(answer);
  const currentRef = useRef(current);
  const dailyUpdatedAtRef = useRef(dailyUpdatedAt);
  const statsRef = useRef(stats);

  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    guessesRef.current = guesses;
    resultsRef.current = results;
    statusRef.current = status;
    answerRef.current = answer;
    currentRef.current = current;
    dailyUpdatedAtRef.current = dailyUpdatedAt;
    statsRef.current = stats;
  }, [guesses, results, status, answer, current, dailyUpdatedAt, stats]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const showNotice = useCallback(
    (key: NoticeKey, withShake: boolean, ms = 1600) => {
      setNotice(key);
      if (withShake) {
        setShake(true);
        schedule(() => setShake(false), 500);
      }
      schedule(() => setNotice(null), ms);
    },
    [schedule],
  );

  const snapshotDailyState = useCallback(
    (
      overrides?: Partial<
        Pick<DailyState, "guesses" | "results" | "status" | "answer" | "updatedAt">
      >,
    ): DailyState | null => {
      if (mode !== "daily") return null;
      return {
        dateKey: todayKey(),
        guesses: overrides?.guesses ?? guessesRef.current,
        results: overrides?.results ?? resultsRef.current,
        status: overrides?.status ?? statusRef.current,
        answer: overrides?.answer ?? answerRef.current,
        updatedAt: overrides?.updatedAt ?? dailyUpdatedAtRef.current,
      };
    },
    [mode],
  );

  const syncSnapshot = useCallback(
    async (payload: WordleSyncRequest) => postSync(payload),
    [],
  );

  const applySyncResponse = useCallback(
    (
      response: WordleSyncResponse,
      requestStats: WordleStats,
      requestDailyState: DailyState | null,
    ) => {
      const nextStats = response.stats
        ? normalizeWordleStats(response.stats)
        : requestStats;
      if (
        sameStatsContent(statsRef.current, requestStats) &&
        !sameStatsContent(statsRef.current, nextStats)
      ) {
        setStats(nextStats);
      }

      if (mode !== "daily") return;
      const nextDailyState = normalizeDailyState(response.dailyState);
      if (!nextDailyState) return;

      const localStateNow = snapshotDailyState();
      if (
        currentRef.current === "" &&
        sameDailyStateContent(localStateNow, requestDailyState) &&
        !sameDailyStateContent(localStateNow, nextDailyState)
      ) {
        setSkipFlipAnim(true);
        schedule(() => setSkipFlipAnim(false), 50);
        setGuesses(nextDailyState.guesses);
        setResults(nextDailyState.results);
        setStatus(nextDailyState.status);
        setAnswer(nextDailyState.answer);
        setDailyUpdatedAt(nextDailyState.updatedAt);
      }
    },
    [mode, schedule, snapshotDailyState],
  );

  const flushSync = useCallback(async () => {
    if (!isAuthenticated || !ready) return false;

    const requestStats = statsRef.current;
    const requestDailyState = snapshotDailyState();
    const response = await syncSnapshot({
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
    mode,
    ready,
    snapshotDailyState,
    syncSnapshot,
  ]);

  // Practice mode: the server picks the answer and signs it into a token.
  const startPractice = useCallback(() => {
    postGuess({ mode: "practice", guesses: [] })
      .then((data) => {
        if (data.token) setToken(data.token);
        setReady(true);
      })
      .catch(() => {
        showNotice("networkError", false);
      });
  }, [showNotice]);

  // One-time initialization per mount (WordleRound remounts per mode).
  useEffect(() => {
    let cancelled = false;
    if (mode === "practice") {
      startPractice();
    } else if (restored && needsRestore) {
      // Restored guesses from before server-side evaluation: re-evaluate.
      postGuess({ mode: "daily", guesses: restored.guesses })
        .then((data) => {
          if (cancelled) return;
          // Applying re-evaluated results post-mount would animate the flip;
          // suppress transitions for a tick so a refresh stays static.
          setSkipFlipAnim(true);
          schedule(() => setSkipFlipAnim(false), 50);
          setResults(data.results);
          setStatus(data.status);
          if (data.answer) setAnswer(data.answer);
          setReady(true);
        })
        .catch(() => {
          if (!cancelled) {
            setReady(true);
            showNotice("networkError", false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [mode, restored, needsRestore, startPractice, showNotice, schedule]);

  // Persist daily progress so a refresh resumes the same board.
  useEffect(() => {
    if (mode !== "daily") return;
    saveGameData(SLUG, "daily-state", {
      dateKey: todayKey(),
      guesses,
      results,
      status,
      answer,
      updatedAt: dailyUpdatedAt,
    } satisfies DailyState);
  }, [mode, guesses, results, status, answer, dailyUpdatedAt]);

  useEffect(() => {
    saveGameData(SLUG, `stats-${mode}`, stats);
  }, [mode, stats]);

  useEffect(() => {
    if (!isAuthenticated || !ready || hasInitialSync.current) return;

    const requestStats = statsRef.current;
    const requestDailyState = snapshotDailyState();
    let cancelled = false;

    void syncSnapshot({
      mode,
      stats: requestStats,
      dailyState: requestDailyState,
    }).then((response) => {
      if (cancelled || !response?.authenticated) return;
      applySyncResponse(response, requestStats, requestDailyState);
    }).finally(() => {
      if (!cancelled) hasInitialSync.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [applySyncResponse, isAuthenticated, mode, ready, snapshotDailyState, syncSnapshot]);

  useEffect(() => {
    if (!isAuthenticated || !ready || !hasInitialSync.current) return;

    const timeoutId = window.setTimeout(() => {
      void syncSnapshot({
        mode,
        stats: statsRef.current,
        dailyState: snapshotDailyState(),
      });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [
    isAuthenticated,
    mode,
    ready,
    stats,
    guesses,
    results,
    status,
    answer,
    dailyUpdatedAt,
    snapshotDailyState,
    syncSnapshot,
  ]);

  const recordResult = useCallback(
    (won: boolean, guessCount: number) => {
      setStats((prev) => {
        const next: WordleStats = {
          played: prev.played + 1,
          wins: prev.wins + (won ? 1 : 0),
          currentStreak: won ? prev.currentStreak + 1 : 0,
          maxStreak: won
            ? Math.max(prev.maxStreak, prev.currentStreak + 1)
            : prev.maxStreak,
          distribution: prev.distribution.map((count, i) =>
            won && i === guessCount - 1 ? count + 1 : count,
          ),
          updatedAt: Date.now(),
        };
        return next;
      });
    },
    [],
  );

  const submitGuess = useCallback(async () => {
    if (status !== "playing" || revealing || submitting || !ready) return;
    if (current.length < WORD_LENGTH) {
      playInvalid();
      vibrateInvalid();
      showNotice("notEnoughLetters", true);
      return;
    }

    const nextGuesses = [...guesses, current];
    setSubmitting(true);

    let data: GuessResponse;
    try {
      data = await postGuess({
        mode,
        guesses: nextGuesses,
        ...(token ? { token } : {}),
      });
    } catch (error) {
      // Rejected (or unreachable) — the typed letters stay on the input row.
      setSubmitting(false);
      playInvalid();
      vibrateInvalid();
      showNotice(
        error instanceof GuessApiError && error.kind === "invalid"
          ? "notInWordList"
          : "networkError",
        true,
      );
      return;
    }

    // Accepted: clear the input row only now (it doubles as the pending
    // indicator while the request is in flight) and start the flip reveal.
    const progressUpdatedAt = Date.now();
    setSubmitting(false);
    setCurrent("");
    setRevealing(true);
    playTap();
    setGuesses(nextGuesses);
    setResults(data.results);
    if (mode === "daily") setDailyUpdatedAt(progressUpdatedAt);

    // Win/lose only after the flip reveal finishes, so colors don't leak.
    schedule(() => {
      setRevealing(false);
      if (data.status !== "playing") {
        const completedAt = Date.now();
        setStatus(data.status);
        if (data.answer) setAnswer(data.answer);
        if (mode === "daily") setDailyUpdatedAt(completedAt);
        recordResult(data.status === "won", nextGuesses.length);
        if (data.status === "won") {
          setJustWon(true);
          playWin();
          vibrateWin();
        } else {
          playLose();
        }
        showNotice(
          data.status === "won" ? "winMessage" : "loseMessage",
          false,
          3000,
        );
      }
    }, REVEAL_MS);
  }, [
    status,
    revealing,
    submitting,
    ready,
    current,
    guesses,
    mode,
    token,
    schedule,
    recordResult,
    showNotice,
  ]);

  const onChar = useCallback(
    (ch: string) => {
      if (status !== "playing" || revealing || submitting) return;
      if (current.length >= WORD_LENGTH) return;
      playKey();
      vibrateKey();
      setCurrent((prev) =>
        prev.length < WORD_LENGTH ? prev + ch.toLowerCase() : prev,
      );
    },
    [status, revealing, submitting, current],
  );

  const onDelete = useCallback(() => {
    if (status !== "playing" || revealing || submitting) return;
    if (current.length === 0) return;
    playKey();
    setCurrent((prev) => prev.slice(0, -1));
  }, [status, revealing, submitting, current]);

  // Physical keyboard support.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[a-zA-Z]$/.test(event.key)) {
        onChar(event.key);
      } else if (event.key === "Enter") {
        void submitGuess();
      } else if (event.key === "Backspace") {
        onDelete();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onChar, onDelete, submitGuess]);

  // Keyboard colors lag the board until the just-submitted row finishes its
  // staggered flip (REVEAL_MS): while `revealing` is true the latest row is
  // excluded from the merge, so keys only recolor once the flip completes.
  const letterStates = useMemo(() => {
    const revealed = revealing ? results.slice(0, -1) : results;
    const states: Record<string, LetterState> = {};
    revealed.forEach((evaluation, row) => {
      guesses[row]?.split("").forEach((ch, i) => {
        const prev = states[ch];
        if (
          !prev ||
          LETTER_STATE_PRIORITY[evaluation[i]] > LETTER_STATE_PRIORITY[prev]
        ) {
          states[ch] = evaluation[i];
        }
      });
    });
    return states;
  }, [guesses, results, revealing]);

  /** Practice mode only: start a fresh round with a new server-picked answer. */
  const restart = useCallback(() => {
    if (mode !== "practice") return;
    setGuesses([]);
    setResults([]);
    setCurrent("");
    setToken(null);
    setStatus("playing");
    setRevealing(false);
    setSubmitting(false);
    setNotice(null);
    setAnswer(null);
    setReady(false);
    setJustWon(false);
    startPractice();
  }, [mode, startPractice]);

  return {
    answer,
    guesses,
    results,
    current,
    status,
    revealing,
    submitting,
    shake,
    notice,
    justWon,
    stats,
    letterStates,
    skipFlipAnim,
    onChar,
    onDelete,
    submitGuess,
    flushSync,
    restart,
  };
}
