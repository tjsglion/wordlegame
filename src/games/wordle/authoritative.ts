import {
  evaluateGuess,
  MAX_GUESSES,
  WORD_LENGTH,
} from "./shared";
import {
  normalizeDailyState,
  type DailyState,
} from "./persistence";

export function isWordleGuessShape(guess: string): boolean {
  return guess.length === WORD_LENGTH && /^[a-z]+$/.test(guess);
}

export function deriveAuthoritativeDailyStateFromAnswer(
  value: Partial<DailyState> | null | undefined,
  answer: string,
  dateKey: string,
): DailyState | null {
  const normalized = normalizeDailyState(value);
  if (!normalized || normalized.dateKey !== dateKey) return null;
  if (
    normalized.guesses.length > MAX_GUESSES ||
    normalized.guesses.some((guess) => !isWordleGuessShape(guess))
  ) {
    return null;
  }

  const results = normalized.guesses.map((guess) => evaluateGuess(guess, answer));
  const won = normalized.guesses[normalized.guesses.length - 1] === answer;
  const status = won
    ? "won"
    : normalized.guesses.length >= MAX_GUESSES
      ? "lost"
      : "playing";

  return {
    dateKey,
    guesses: normalized.guesses,
    results,
    status,
    answer: status === "playing" ? null : answer,
    updatedAt: normalized.updatedAt,
  };
}
