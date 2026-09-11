import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { pickDaily, todayKey } from "@/lib/game/daily";
import {
  wordleAnswerPool,
  wordleDailyPuzzles,
  wordleGuessWords,
} from "./schema";
import { loadWordListsFromSource } from "./wordle-word-source";

const BATCH_SIZE = 400;
const DAILY_DAYS = Number(process.env.WORDLE_DAILY_SEED_DAYS ?? 365);
const DAILY_START = process.env.WORDLE_DAILY_START_DATE ?? todayKey();

function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return todayKey(date);
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size) as T[]);
  }
  return chunks;
}

async function seed() {
  const url = process.env.DATABASE_URL || "file:local.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  const { answers, allowedGuesses } = loadWordListsFromSource();

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log(`Seeding Wordle content into ${url}`);
  console.log(`Answer pool: ${answers.length}`);
  console.log(`Allowed guesses: ${allowedGuesses.length}`);
  console.log(`Daily schedule: ${DAILY_START} + ${DAILY_DAYS} days`);

  await db.delete(wordleDailyPuzzles);
  await db.delete(wordleGuessWords);
  await db.delete(wordleAnswerPool);

  const answerRows = answers.map((word) => ({ word, enabled: true }));
  for (const batch of chunk(answerRows, BATCH_SIZE)) {
    await db.insert(wordleAnswerPool).values(batch);
  }

  const guessRows = allowedGuesses.map((word) => ({ word }));
  for (const batch of chunk(guessRows, BATCH_SIZE)) {
    await db.insert(wordleGuessWords).values(batch);
  }

  const dailyRows = Array.from({ length: DAILY_DAYS }, (_, index) => {
    const dateKey = addUtcDays(DAILY_START, index);
    return {
      dateKey,
      answerWord: pickDaily(answers, dateKey, "wordle"),
    };
  });
  for (const batch of chunk(dailyRows, BATCH_SIZE)) {
    await db.insert(wordleDailyPuzzles).values(batch);
  }

  console.log("✓ Seeded Wordle answer pool, guesses, and daily puzzles");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
