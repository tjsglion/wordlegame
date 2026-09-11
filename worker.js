import { eq } from "drizzle-orm";
import { getDb } from "./src/lib/db";
import { ensureWordleDailySchedule } from "./src/games/wordle/daily-schedule";
import { wordleAnswerPool } from "./src/lib/drizzle/schema";
import { todayKey } from "./src/lib/game/daily";

async function topUpWordleDailySchedule() {
  const db = getDb();
  const rows = await db
    .select({ word: wordleAnswerPool.word })
    .from(wordleAnswerPool)
    .where(eq(wordleAnswerPool.enabled, true));

  const answers = rows.map((row) => row.word);
  if (answers.length === 0) return;

  await ensureWordleDailySchedule(db, answers, todayKey());
}

const worker = {
  async fetch(request, env, ctx) {
    const { default: openNextWorker } = await import("./.open-next/worker.js");
    return openNextWorker.fetch(request, env, ctx);
  },
  async scheduled(_controller, _env, ctx) {
    ctx.waitUntil(topUpWordleDailySchedule());
  },
};

export default worker;
