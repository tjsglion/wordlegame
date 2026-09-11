import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { wordleDailyPuzzles } from "@/lib/drizzle/schema";
import { pickDaily, todayKey } from "@/lib/game/daily";
import {
  normalizeDailyState,
  type DailyState,
} from "./persistence";
import { ensureWordleDailySchedule } from "./daily-schedule";
import { deriveAuthoritativeDailyStateFromAnswer } from "./authoritative";
import { ALLOWED_GUESSES, ANSWERS } from "@/lib/game/words";

const SLUG = "wordle";

let lastScheduleCheckDateKey: string | null = null;

export async function resolveDailyAnswer(dateKey: string): Promise<string> {
  try {
    const db = getDb();
    if (lastScheduleCheckDateKey !== dateKey) {
      await ensureWordleDailySchedule(db, ANSWERS, dateKey);
      lastScheduleCheckDateKey = dateKey;
    }
    const row = await db
      .select({ answerWord: wordleDailyPuzzles.answerWord })
      .from(wordleDailyPuzzles)
      .where(eq(wordleDailyPuzzles.dateKey, dateKey))
      .limit(1)
      .then((rows) => rows[0]);

    if (row?.answerWord && ANSWERS.includes(row.answerWord)) {
      return row.answerWord;
    }
  } catch {
    lastScheduleCheckDateKey = null;
  }

  return pickDaily(ANSWERS, dateKey, SLUG);
}

function hasValidGuesses(guesses: string[]): boolean {
  return guesses.every((guess) => ALLOWED_GUESSES.has(guess));
}

export async function buildAuthoritativeDailyState(
  value: Partial<DailyState> | null | undefined,
  dateKey = todayKey(),
): Promise<DailyState | null> {
  const normalized = normalizeDailyState(value);
  if (!normalized || normalized.dateKey !== dateKey) return null;
  if (!hasValidGuesses(normalized.guesses)) return null;

  const answer = await resolveDailyAnswer(dateKey);
  return buildAuthoritativeDailyStateFromAnswer(normalized, answer, dateKey);
}

export function buildAuthoritativeDailyStateFromAnswer(
  value: Partial<DailyState> | null | undefined,
  answer: string,
  dateKey: string,
): DailyState | null {
  const normalized = normalizeDailyState(value);
  if (!normalized || normalized.dateKey !== dateKey) return null;
  if (!hasValidGuesses(normalized.guesses)) return null;
  return deriveAuthoritativeDailyStateFromAnswer(normalized, answer, dateKey);
}
