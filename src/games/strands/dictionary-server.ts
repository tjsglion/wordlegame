import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { commonDictionary } from "@/lib/drizzle/schema";
import {
  createDictionaryFromRows,
} from "./dictionary-rows";
import type { StrandsDictionary } from "./dictionary";

export { createDictionaryFromRows, type CommonDictionaryRow } from "./dictionary-rows";

export async function getStrandsCommonDictionary(): Promise<StrandsDictionary> {
  const rows = await getDb()
    .select({
      word: commonDictionary.word,
      length: commonDictionary.length,
      isCommonWord: commonDictionary.isCommonWord,
    })
    .from(commonDictionary)
    .where(
      and(
        gte(commonDictionary.length, 4),
        eq(commonDictionary.isCommonWord, true),
      ),
    );

  return createDictionaryFromRows(rows);
}
