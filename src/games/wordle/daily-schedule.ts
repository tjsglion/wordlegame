import { desc } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { pickDaily, todayKey } from "@/lib/game/daily";
import { wordleDailyPuzzles } from "@/lib/drizzle/schema";

const DEFAULT_HORIZON_DAYS = Number(process.env.WORDLE_DAILY_HORIZON_DAYS ?? 365);
const DEFAULT_BATCH_SIZE = 400;

export function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return todayKey(date);
}

function daySpanInclusive(startDateKey: string, endDateKey: string): number {
  const start = new Date(`${startDateKey}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDateKey}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size) as T[]);
  }
  return chunks;
}

export function buildWordleDailyRows(
  answers: readonly string[],
  startDateKey: string,
  endDateKey: string,
) {
  const totalDays = daySpanInclusive(startDateKey, endDateKey);
  return Array.from({ length: totalDays }, (_, offset) => {
    const dateKey = addUtcDays(startDateKey, offset);
    return {
      dateKey,
      answerWord: pickDaily(answers, dateKey, "wordle"),
    };
  });
}

export async function ensureWordleDailySchedule(
  db: Db,
  answers: readonly string[],
  fromDateKey = todayKey(),
  horizonDays = DEFAULT_HORIZON_DAYS,
): Promise<number> {
  const targetEndDateKey = addUtcDays(fromDateKey, Math.max(1, horizonDays) - 1);
  const latest = await db
    .select({ dateKey: wordleDailyPuzzles.dateKey })
    .from(wordleDailyPuzzles)
    .orderBy(desc(wordleDailyPuzzles.dateKey))
    .limit(1)
    .then((rows) => rows[0]?.dateKey ?? null);

  const startDateKey =
    !latest || latest < fromDateKey ? fromDateKey : addUtcDays(latest, 1);

  if (startDateKey > targetEndDateKey) return 0;

  const rows = buildWordleDailyRows(answers, startDateKey, targetEndDateKey);
  for (const batch of chunk(rows, DEFAULT_BATCH_SIZE)) {
    await db.insert(wordleDailyPuzzles).values(batch).onConflictDoNothing();
  }
  return rows.length;
}
