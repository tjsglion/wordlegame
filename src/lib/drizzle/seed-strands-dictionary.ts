import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "dotenv";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  buildCommonDictionaryWords,
  STRANDS_DICTIONARY_TARGET_SIZE,
  type WordFrequency,
} from "@/games/strands/dictionary";
import { commonDictionary } from "./schema";

const BATCH_SIZE = 400;
const require = createRequire(import.meta.url);

type StrandsDictionaryRow = {
  word: string;
  length: number;
  isCommonWord: true;
};

type DictionaryMutation = {
  delete(table: typeof commonDictionary): PromiseLike<unknown>;
  insert(table: typeof commonDictionary): {
    values(rows: StrandsDictionaryRow[]): PromiseLike<unknown>;
  };
};

type DictionaryTransactionDatabase<TTransaction extends DictionaryMutation> = {
  transaction<T>(callback: (transaction: TTransaction) => T | Promise<T>): Promise<T>;
};

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error("size must be a positive safe integer");
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size) as T[]);
  }
  return chunks;
}

export function buildStrandsDictionaryRows(
  words: readonly string[],
): StrandsDictionaryRow[] {
  return words.map((rawWord) => {
    const word = rawWord.toUpperCase();
    return { word, length: word.length, isCommonWord: true };
  });
}

function loadDictionaryWords(): string[] {
  const dictionary = require("an-array-of-english-words") as readonly string[];
  const frequencies = require("subtlex-word-frequencies") as readonly WordFrequency[];
  const blacklist = require("naughty-words/en.json") as readonly string[];
  const words = buildCommonDictionaryWords({ dictionary, frequencies, blacklist });

  if (words.length !== STRANDS_DICTIONARY_TARGET_SIZE) {
    throw new Error(`Expected exactly ${STRANDS_DICTIONARY_TARGET_SIZE} dictionary words`);
  }

  return words;
}

export async function insertStrandsDictionaryRows<TTransaction extends DictionaryMutation>(
  db: DictionaryTransactionDatabase<TTransaction>,
  rows: readonly StrandsDictionaryRow[],
) {
  await db.transaction(async (tx) => {
    await tx.delete(commonDictionary);
    for (const batch of chunk(rows, BATCH_SIZE)) {
      await tx.insert(commonDictionary).values(batch);
    }
  });
}

export async function seedStrandsDictionary() {
  // Construct and validate the complete list before opening a destructive DB operation.
  const words = loadDictionaryWords();
  const rows = buildStrandsDictionaryRows(words);
  const url = process.env.DATABASE_URL || "file:local.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  const client = createClient({ url, authToken });
  const db = drizzle(client);

  await insertStrandsDictionaryRows(db, rows);

  const lengthDistribution = rows.reduce<Record<number, number>>((distribution, row) => {
    distribution[row.length] = (distribution[row.length] ?? 0) + 1;
    return distribution;
  }, {});
  console.log(`Seeded ${rows.length} Strands dictionary words`);
  console.log("Length distribution:", lengthDistribution);
}

const isMainModule = process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  config({ path: [".env.local", ".env"] });
  seedStrandsDictionary().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
