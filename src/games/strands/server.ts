import { and, eq, sql } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db";
import { dailyStrands, strandsPuzzles } from "@/lib/drizzle/schema";
import { validatePuzzle, type StrandsArticleDb, type StrandsPuzzleData } from "./shared";
import { getStrandsSolutionPaths } from "./solution-paths";

interface StrandsPuzzleRow {
  id: string;
  theme: string;
  spangram: string;
  words: string;
  validWords: string;
  grid: string;
  article: string | null;
}

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const value = (error as { code?: unknown }).code;
  return typeof value === "string" ? value : null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function isStrandsDatabaseUnavailable(error: unknown): boolean {
  const cause = typeof error === "object" && error !== null
    ? (error as { cause?: unknown }).cause
    : null;
  if (isAbortError(error) || isAbortError(cause)) return true;
  return [getErrorCode(error), getErrorCode(cause)].some((code) =>
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT",
  );
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function parseStrandsPuzzleRow(
  row: StrandsPuzzleRow,
  date: string,
): StrandsPuzzleData | null {
  const words = parseJson<string[]>(row.words);
  const validWords = parseJson<string[]>(row.validWords);
  const grid = parseJson<string[][]>(row.grid);
  const article = row.article === null ? null : parseJson<StrandsArticleDb | null>(row.article);
  if (words === null || validWords === null || grid === null || article === undefined) return null;

  const puzzle: StrandsPuzzleData = {
    date,
    puzzle: {
      id: row.id,
      theme: row.theme,
      spangram: row.spangram,
      words,
      validWords,
      grid,
      article,
    },
  };
  return validatePuzzle(puzzle).length === 0 && getStrandsSolutionPaths(puzzle.puzzle) ? puzzle : null;
}

export function toPracticeStrandsPuzzle(
  puzzle: StrandsPuzzleData,
  epochMillis: number,
): StrandsPuzzleData {
  const date = `practice_${epochMillis}`;
  return {
    date,
    puzzle: {
      ...puzzle.puzzle,
      id: `practice_${puzzle.puzzle.id}`,
      words: [...puzzle.puzzle.words],
      validWords: [...puzzle.puzzle.validWords],
      grid: puzzle.puzzle.grid.map((row) => [...row]),
      article: puzzle.puzzle.article
        ? { ...puzzle.puzzle.article, wordHints: puzzle.puzzle.article.wordHints.map((hint) => ({ ...hint })) }
        : null,
    },
  };
}

export async function getDailyStrandsPuzzle(
  date: string,
  db: Db = getDb(),
): Promise<StrandsPuzzleData | null> {
  try {
    const rows = await db
      .select({
        id: strandsPuzzles.id,
        theme: strandsPuzzles.theme,
        spangram: strandsPuzzles.spangram,
        words: strandsPuzzles.words,
        validWords: strandsPuzzles.validWords,
        grid: strandsPuzzles.grid,
        article: strandsPuzzles.article,
      })
      .from(dailyStrands)
      .innerJoin(strandsPuzzles, eq(dailyStrands.puzzleId, strandsPuzzles.id))
      .where(eq(dailyStrands.date, date))
      .limit(1);
    const row = rows[0];
    return row ? parseStrandsPuzzleRow(row, date) : null;
  } catch (error) {
    if (isStrandsDatabaseUnavailable(error)) return null;
    throw error;
  }
}

export async function getRandomStrandsPracticePuzzle(
  epochMillis: number,
  requestedPuzzleId?: string,
  db: Db = getDb(),
): Promise<StrandsPuzzleData | null> {
  try {
    const selection = db
      .select({
        id: strandsPuzzles.id,
        theme: strandsPuzzles.theme,
        spangram: strandsPuzzles.spangram,
        words: strandsPuzzles.words,
        validWords: strandsPuzzles.validWords,
        grid: strandsPuzzles.grid,
        article: strandsPuzzles.article,
      })
      .from(strandsPuzzles);
    let rows;
    if (requestedPuzzleId) {
      rows = await selection.where(eq(strandsPuzzles.id, requestedPuzzleId)).limit(1);
    } else {
      // rowid pivot sampling works for legacy and UUID IDs alike, unlike an ID
      // lexicographic pivot, and avoids SQLite's full-table RANDOM() sort.
      rows = await selection
        .where(sql`rowid >= ((random() & 9223372036854775807) % (SELECT max(rowid) FROM strands_puzzles))`)
        .orderBy(sql`rowid`)
        .limit(1);
      if (rows.length === 0) rows = await selection.orderBy(sql`rowid`).limit(1);
    }
    const puzzle = rows[0] ? parseStrandsPuzzleRow(rows[0], "inventory") : null;
    return puzzle ? toPracticeStrandsPuzzle(puzzle, epochMillis) : null;
  } catch (error) {
    if (isStrandsDatabaseUnavailable(error)) return null;
    throw error;
  }
}

export async function isAssignedDailyStrandsPuzzle(
  date: string,
  puzzleId: string,
  db: Db = getDb(),
): Promise<boolean> {
  const rows = await db
    .select({ date: dailyStrands.date })
    .from(dailyStrands)
    .where(and(eq(dailyStrands.date, date), eq(dailyStrands.puzzleId, puzzleId)))
    .limit(1);
  return rows.length === 1;
}
