import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { formatSqliteDateTime } from "@/lib/drizzle/date-time";
import { wordClues } from "@/lib/drizzle/schema";
import {
  generateRuntimeClue,
  type GeneratedClue,
} from "@/games/stackdown/clue-generation";

/**
 * Clue lookup for game hint endpoints — SERVER ONLY.
 *
 * Primary path: read the pre-generated clue from the database.
 * Recovery path: when a clue is missing, the route can schedule a best-effort
 * backfill that generates a clue off the critical path and persists it.
 */

const cache = new Map<string, string | null>();
const backfillInFlight = new Map<string, Promise<boolean>>();

let backfillGeneratorForTests:
  | ((word: string) => Promise<GeneratedClue | null>)
  | null = null;

function shouldPersistBackfills(): boolean {
  return process.env.STACKDOWN_DISABLE_CLUE_PERSIST !== "1";
}

export async function clueForWord(word: string): Promise<string | null> {
  const cached = cache.get(word);
  if (cached !== undefined) return cached;

  const db = getDb();
  const row = await db
    .select({ clue: wordClues.clue })
    .from(wordClues)
    .where(eq(wordClues.word, word))
    .limit(1)
    .then((rows) => rows[0]);

  const clue = row?.clue ?? null;
  cache.set(word, clue);
  return clue;
}

async function persistGeneratedClue(
  word: string,
  generated: GeneratedClue,
): Promise<void> {
  const db = getDb();
  const updatedAt = formatSqliteDateTime();
  await db
    .insert(wordClues)
    .values({
      word,
      clue: generated.clue,
      source: generated.source,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: wordClues.word,
      set: {
        clue: sql`excluded.clue`,
        source: sql`excluded.source`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
  cache.set(word, generated.clue);
}

export async function backfillClueForWord(word: string): Promise<boolean> {
  const cached = cache.get(word);
  if (typeof cached === "string") return true;

  const inFlight = backfillInFlight.get(word);
  if (inFlight) return inFlight;

  const task = (async () => {
    try {
      const generated = backfillGeneratorForTests
        ? await backfillGeneratorForTests(word)
        : await generateRuntimeClue(word);
      if (!generated) {
        console.warn(`[stackdown-clue-backfill] no clue generated for "${word}"`);
        return false;
      }

      const persisted = shouldPersistBackfills();
      if (persisted) {
        await persistGeneratedClue(word, generated);
      } else {
        // Tests must never mutate the configured database, even when they
        // exercise the backfill path.
        cache.set(word, generated.clue);
      }
      console.info(
        `[stackdown-clue-backfill] ${persisted ? "wrote" : "cached"} ${
          generated.source
        } clue for "${word}"`,
      );
      return true;
    } catch (error) {
      console.error(
        `[stackdown-clue-backfill] failed for "${word}"`,
        error,
      );
      return false;
    } finally {
      backfillInFlight.delete(word);
    }
  })();

  backfillInFlight.set(word, task);
  return task;
}

/** Test hook: pre-populate the per-process clue cache without a database. */
export function primeClueCacheForTests(
  entries: Record<string, string | null>,
): void {
  for (const [word, clue] of Object.entries(entries)) {
    cache.set(word, clue);
  }
}

export function setClueBackfillGeneratorForTests(
  generator: ((word: string) => Promise<GeneratedClue | null>) | null,
): void {
  backfillGeneratorForTests = generator;
}
