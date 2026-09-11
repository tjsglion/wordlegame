import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import {
  formatSqliteDateTime,
  parseSqliteDateTime,
} from "@/lib/drizzle/date-time";
import { todayKey } from "@/lib/game/daily";
import {
  gameDailyProgress,
  gameUserStats,
} from "@/lib/drizzle/schema";
import {
  mergeDailyState,
  mergeWordleStats,
  normalizeDailyState,
  normalizeWordleStats,
  WORDLE_SLUG,
  type DailyState,
  type WordleStats,
  type WordleSyncRequest,
  type WordleSyncResponse,
} from "@/games/wordle/persistence";
import { buildAuthoritativeDailyState } from "@/games/wordle/server";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToStats(
  row: typeof gameUserStats.$inferSelect | undefined,
): WordleStats | null {
  if (!row) return null;
  return normalizeWordleStats({
    played: row.played,
    wins: row.wins,
    currentStreak: row.currentStreak,
    maxStreak: row.maxStreak,
    distribution: parseJson<number[]>(row.distributionJson, []),
    updatedAt: parseSqliteDateTime(row.updatedAt),
  });
}

function rowToDailyState(
  row: typeof gameDailyProgress.$inferSelect | undefined,
): DailyState | null {
  if (!row) return null;
  return normalizeDailyState({
    dateKey: row.dateKey,
    guesses: parseJson<string[]>(row.guessesJson, []),
    results: parseJson<DailyState["results"]>(row.resultsJson, []),
    status: row.status as DailyState["status"],
    answer: row.answer,
    updatedAt: parseSqliteDateTime(row.updatedAt),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    const response: WordleSyncResponse = {
      authenticated: false,
      stats: null,
      dailyState: null,
    };
    return NextResponse.json(response);
  }

  let body: Partial<WordleSyncRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const mode = body.mode === "practice" ? "practice" : "daily";
  const db = getDb();

  const [statsRow, dailyRow] = await Promise.all([
    db
      .select()
      .from(gameUserStats)
      .where(
        and(
          eq(gameUserStats.userId, userId),
          eq(gameUserStats.gameSlug, WORDLE_SLUG),
          eq(gameUserStats.mode, mode),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]),
    mode === "daily"
      ? db
          .select()
          .from(gameDailyProgress)
          .where(
            and(
              eq(gameDailyProgress.userId, userId),
              eq(gameDailyProgress.gameSlug, WORDLE_SLUG),
              eq(gameDailyProgress.dateKey, todayKey()),
            ),
          )
          .limit(1)
          .then((rows) => rows[0])
      : Promise.resolve(undefined),
  ]);

  const authoritativeDailyState =
    mode === "daily"
      ? await buildAuthoritativeDailyState(body.dailyState, todayKey())
      : null;
  const mergedStats = mergeWordleStats(body.stats, rowToStats(statsRow));
  const mergedDailyState =
    mode === "daily"
      ? mergeDailyState(authoritativeDailyState, rowToDailyState(dailyRow))
      : null;

  await db
    .insert(gameUserStats)
    .values({
      userId,
      gameSlug: WORDLE_SLUG,
      mode,
      played: mergedStats.played,
      wins: mergedStats.wins,
      currentStreak: mergedStats.currentStreak,
      maxStreak: mergedStats.maxStreak,
      distributionJson: JSON.stringify(mergedStats.distribution),
      updatedAt: formatSqliteDateTime(mergedStats.updatedAt),
    })
    .onConflictDoUpdate({
      target: [gameUserStats.userId, gameUserStats.gameSlug, gameUserStats.mode],
      set: {
        played: mergedStats.played,
        wins: mergedStats.wins,
        currentStreak: mergedStats.currentStreak,
        maxStreak: mergedStats.maxStreak,
        distributionJson: JSON.stringify(mergedStats.distribution),
        updatedAt: formatSqliteDateTime(mergedStats.updatedAt),
      },
    });

  if (mode === "daily" && mergedDailyState) {
    await db
      .insert(gameDailyProgress)
      .values({
        userId,
        gameSlug: WORDLE_SLUG,
        dateKey: mergedDailyState.dateKey,
        guessesJson: JSON.stringify(mergedDailyState.guesses),
        resultsJson: JSON.stringify(mergedDailyState.results),
        status: mergedDailyState.status,
        answer: mergedDailyState.answer,
        updatedAt: formatSqliteDateTime(mergedDailyState.updatedAt),
      })
      .onConflictDoUpdate({
        target: [
          gameDailyProgress.userId,
          gameDailyProgress.gameSlug,
          gameDailyProgress.dateKey,
        ],
        set: {
          guessesJson: JSON.stringify(mergedDailyState.guesses),
          resultsJson: JSON.stringify(mergedDailyState.results),
          status: mergedDailyState.status,
          answer: mergedDailyState.answer,
          updatedAt: formatSqliteDateTime(mergedDailyState.updatedAt),
        },
      });
  }

  const response: WordleSyncResponse = {
    authenticated: true,
    stats: mergedStats,
    dailyState: mergedDailyState,
  };
  return NextResponse.json(response);
}
