import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { commonDictionary, dailyStrands, strandsPuzzles } from "@/lib/drizzle/schema";
import { todayKey } from "@/lib/game/daily";
import type { Db } from "@/lib/db";
import { createDictionaryFromRows } from "./dictionary-rows";
import {
  createSiliconFlowStrandsClient,
  generateDailyStrandsPuzzle,
  type StrandsGenerationClient,
  type StrandsTopicHistory,
} from "./generation-service";

const LOOKAHEAD_DAYS = 3;

function dateKeyAfter(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return todayKey(next);
}

/** Assign inventory first, then generate only what is needed to fill the UTC lookahead. */
export async function distributeStrandsDaily(
  db: Db,
  now: Date = new Date(),
  dependencies: {
    client?: StrandsGenerationClient;
    createClient?: () => StrandsGenerationClient;
    generate?: typeof generateDailyStrandsPuzzle;
  } = {},
) {
  let assigned = 0;
  let dictionary: Awaited<ReturnType<typeof loadDictionary>> | null = null;
  let history: StrandsTopicHistory[] | null = null;
  const generate = dependencies.generate ?? generateDailyStrandsPuzzle;
  let client = dependencies.client;

  for (let offset = 0; offset <= LOOKAHEAD_DAYS; offset++) {
    const date = dateKeyAfter(now, offset);
    const existing = await db
      .select({ date: dailyStrands.date })
      .from(dailyStrands)
      .where(eq(dailyStrands.date, date))
      .limit(1);
    if (existing.length > 0) continue;

    let puzzle = await db
      .select({ id: strandsPuzzles.id })
      .from(strandsPuzzles)
      .where(isNull(strandsPuzzles.usedAt))
      .orderBy(desc(strandsPuzzles.createdAt))
      .limit(1);
    try {
      if (!puzzle[0]) {
        dictionary ??= await loadDictionary(db);
        history ??= await loadTopicHistory(db);
        client ??= dependencies.createClient?.() ?? createSiliconFlowStrandsClient();
        const generated = await generate({ client, dictionary, history });
        const puzzleId = crypto.randomUUID();
        await db.insert(strandsPuzzles).values({
          id: puzzleId,
          topic: generated.topic,
          theme: generated.theme,
          themeEmbedding: generated.themeEmbedding ? JSON.stringify(generated.themeEmbedding) : null,
          spangram: generated.spangram,
          words: JSON.stringify(generated.words),
          validWords: JSON.stringify(generated.validWords),
          grid: JSON.stringify(generated.grid),
        });
        history.push({ topic: generated.topic, embedding: generated.themeEmbedding });
        puzzle = [{ id: puzzleId }];
      }

      const puzzleId = puzzle[0].id;
      await db.transaction(async (tx) => {
        await tx.insert(dailyStrands).values({ date, puzzleId });
        const claim = await tx
          .update(strandsPuzzles)
          .set({ usedAt: now.toISOString() })
          .where(and(eq(strandsPuzzles.id, puzzleId), isNull(strandsPuzzles.usedAt)));
        if (claim.rowsAffected !== 1) {
          throw new Error(`Strands puzzle ${puzzleId} was claimed by another scheduler`);
        }
      });
      assigned++;
    } catch (error) {
      // One failed day must not stop pre-filling the remaining dates. The next
      // cron run retries any still-unassigned day.
      console.error(`Unable to assign Strands puzzle for ${date}`, error);
    }
  }
  return assigned;
}

async function loadDictionary(db: Db) {
  const rows = await db
    .select({
      word: commonDictionary.word,
      length: commonDictionary.length,
      isCommonWord: commonDictionary.isCommonWord,
    })
    .from(commonDictionary)
    .where(and(gte(commonDictionary.length, 4), eq(commonDictionary.isCommonWord, true)));
  return createDictionaryFromRows(rows);
}

async function loadTopicHistory(db: Db): Promise<StrandsTopicHistory[]> {
  const rows = await db
    .select({
      topic: strandsPuzzles.topic,
      theme: strandsPuzzles.theme,
      themeEmbedding: strandsPuzzles.themeEmbedding,
    })
    .from(strandsPuzzles);
  return rows.map(({ topic, theme, themeEmbedding }) => ({
    topic: topic?.trim() || theme,
    embedding: parseEmbedding(themeEmbedding),
  }));
}

function parseEmbedding(value: string | null): number[] | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0
      && parsed.every((item) => typeof item === "number" && Number.isFinite(item))
      ? parsed
      : null;
  } catch {
    return null;
  }
}
