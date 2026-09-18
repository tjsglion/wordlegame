import { eq } from "drizzle-orm";
import { getDb } from "./src/lib/db";
import { ensureWordleDailySchedule } from "./src/games/wordle/daily-schedule";
import { wordleAnswerPool } from "./src/lib/drizzle/schema";
import { todayKey } from "./src/lib/game/daily";
import { distributeStrandsDaily } from "./src/games/strands/daily-schedule";
import { createSiliconFlowStrandsClient } from "./src/games/strands/generation-service";

async function topUpWordleDailySchedule(db) {
  const rows = await db
    .select({ word: wordleAnswerPool.word })
    .from(wordleAnswerPool)
    .where(eq(wordleAnswerPool.enabled, true));

  const answers = rows.map((row) => row.word);
  if (answers.length === 0) return;

  await ensureWordleDailySchedule(db, answers, todayKey());
}

export function getRuntimeConfig(env) {
  return {
    databaseUrl: env?.DATABASE_URL,
    databaseAuthToken: env?.DATABASE_AUTH_TOKEN,
    siliconFlow: {
      apiKey: env?.SILICONFLOW_API_KEY ?? env?.DEEPSEEK_API_KEY,
      baseUrl: env?.SILICONFLOW_BASE_URL,
      chatModel: env?.SILICONFLOW_CHAT_MODEL,
      embeddingModel: env?.SILICONFLOW_EMBEDDING_MODEL,
    },
  };
}

async function maintainDailyPuzzles(env) {
  const runtime = getRuntimeConfig(env);
  const db = getDb(runtime);
  await Promise.allSettled([
    topUpWordleDailySchedule(db),
    distributeStrandsDaily(db, new Date(), {
      createClient: () => createSiliconFlowStrandsClient(runtime.siliconFlow),
    }),
  ]);
}

const worker = {
  async fetch(request, env, ctx) {
    const { default: openNextWorker } = await import("./.open-next/worker.js");
    return openNextWorker.fetch(request, env, ctx);
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(maintainDailyPuzzles(env));
  },
};

export default worker;
