/**
 * Shared Wordle rules — isomorphic (no browser or server-only APIs), so both
 * the client UI and the guess API route can import them.
 *
 * The word lists and the answer itself stay server-side
 * (src/lib/game/words.ts, `import "server-only"`); only the rules live here.
 */

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type LetterState = "correct" | "present" | "absent";
export type GameStatus = "playing" | "won" | "lost";
export type GameMode = "daily" | "practice";

/* Single source of truth for every LetterState-derived mapping. */

/** CSS state class on tile backs and keyboard keys. */
export const LETTER_STATE_CLASS: Record<LetterState, string> = {
  correct: "correct",
  present: "present",
  absent: "absent",
};

/** Emoji square per state on the share card. */
export const LETTER_STATE_EMOJI: Record<LetterState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

/** Merge priority when combining per-letter states for keyboard colors. */
export const LETTER_STATE_PRIORITY: Record<LetterState, number> = {
  absent: 1,
  present: 2,
  correct: 3,
};

/** Milliseconds for one tile flip; rows reveal with a per-tile stagger.
 * The CSS transition's duration is injected from FLIP_DURATION via inline
 * style on the tile (see board.tsx) — do not hardcode it in globals.css. */
export const FLIP_DURATION = 500;
export const FLIP_STAGGER = 250;
/**
 * Time until the last tile of a row finishes flipping. Single source of truth
 * for the keyboard-color lag, the win/lose handoff, and the win bounce delay
 * in board.tsx — keep them all derived from this.
 */
export const REVEAL_MS = FLIP_DURATION + FLIP_STAGGER * (WORD_LENGTH - 1);

/**
 * Classic Wordle evaluation with correct duplicate-letter handling:
 * exact matches first, then yellow for remaining unmatched letters.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if ((remaining[ch] ?? 0) > 0) {
      result[i] = "present";
      remaining[ch] -= 1;
    }
  }
  return result;
}

/** Wire format for POST /api/wordle/guess. */
export interface GuessRequest {
  mode: GameMode;
  /** Full guess history, latest last. Server re-evaluates all of them. */
  guesses: string[];
  /** Practice mode only: token from a previous start response. */
  token?: string;
}

export interface GuessResponse {
  /** Per-guess letter states, aligned with the submitted `guesses`. */
  results: LetterState[][];
  status: GameStatus;
  /** Only present once the round is finished (won or out of guesses). */
  answer?: string;
  /** Practice mode only: token for a freshly started round. */
  token?: string;
}
