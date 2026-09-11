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
  mergeStackdownDailyState,
  mergeStackdownStats,
  normalizeStackdownDailyState,
  normalizeStackdownStats,
  STACKDOWN_SLUG,
  type StackdownDailyState,
  type StackdownStats,
  type StackdownSyncRequest,
  type StackdownSyncResponse,
  type StackdownWordTime,
} from "@/games/stackdown/persistence";
import {
  buildAuthoritativeStackdownDailyState,
  getDailyPuzzle,
} from "@/games/stackdown/server";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToStats(
  row: typeof gameUserStats.$inferSelect | undefined,
): StackdownStats | null {
  if (!row) return null;
  // Stackdown has no lose state; the played column mirrors wins.
  return normalizeStackdownStats({
    wins: row.wins,
    currentStreak: row.currentStreak,
    maxStreak: row.maxStreak,
    distribution: parseJson<number[]>(row.distributionJson, []),
    updatedAt: parseSqliteDateTime(row.updatedAt),
  });
}

interface PersistedResults {
  wordTimes: StackdownWordTime[];
  elapsedMs: number;
}

function rowToDailyState(
  row: typeof gameDailyProgress.$inferSelect | undefined,
): StackdownDailyState | null {
  if (!row) return null;
  const results = parseJson<PersistedResults>(row.resultsJson, {
    wordTimes: [],
    elapsedMs: 0,
  });
  return normalizeStackdownDailyState({
    dateKey: row.dateKey,
    picks: parseJson<number[][]>(row.guessesJson, []),
    wordTimes: results.wordTimes,
    status: row.status === "won" ? "won" : "playing",
    elapsedMs: results.elapsedMs,
    updatedAt: parseSqliteDateTime(row.updatedAt),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    const response: StackdownSyncResponse = {
      authenticated: false,
      stats: null,
      dailyState: null,
    };
    return NextResponse.json(response);
  }

  let body: Partial<StackdownSyncRequest>;
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
          eq(gameUserStats.gameSlug, STACKDOWN_SLUG),
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
              eq(gameDailyProgress.gameSlug, STACKDOWN_SLUG),
              eq(gameDailyProgress.dateKey, todayKey()),
            ),
          )
          .limit(1)
          .then((rows) => rows[0])
      : Promise.resolve(undefined),
  ]);

  const authoritativeDailyState =
    mode === "daily"
      ? buildAuthoritativeStackdownDailyState(body.dailyState, todayKey())
      : null;
  const mergedStats = mergeStackdownStats(body.stats, rowToStats(statsRow));
  const mergedDailyState =
    mode === "daily"
      ? mergeStackdownDailyState(authoritativeDailyState, rowToDailyState(dailyRow))
      : null;

  await db
    .insert(gameUserStats)
    .values({
      userId,
      gameSlug: STACKDOWN_SLUG,
      mode,
      // No lose state: played is kept equal to wins to satisfy NOT NULL.
      played: mergedStats.wins,
      wins: mergedStats.wins,
      currentStreak: mergedStats.currentStreak,
      maxStreak: mergedStats.maxStreak,
      distributionJson: JSON.stringify(mergedStats.distribution),
      updatedAt: formatSqliteDateTime(mergedStats.updatedAt),
    })
    .onConflictDoUpdate({
      target: [gameUserStats.userId, gameUserStats.gameSlug, gameUserStats.mode],
      set: {
        played: mergedStats.wins,
        wins: mergedStats.wins,
        currentStreak: mergedStats.currentStreak,
        maxStreak: mergedStats.maxStreak,
        distributionJson: JSON.stringify(mergedStats.distribution),
        updatedAt: formatSqliteDateTime(mergedStats.updatedAt),
      },
    });

  if (mode === "daily" && mergedDailyState) {
    const results: PersistedResults = {
      wordTimes: mergedDailyState.wordTimes,
      elapsedMs: mergedDailyState.elapsedMs,
    };
    // The solution words are stored only once the round is finished, the
    // same convention Wordle's answer column follows.
    const answer =
      mergedDailyState.status === "won"
        ? getDailyPuzzle(mergedDailyState.dateKey).words.join(" ")
        : null;

    await db
      .insert(gameDailyProgress)
      .values({
        userId,
        gameSlug: STACKDOWN_SLUG,
        dateKey: mergedDailyState.dateKey,
        guessesJson: JSON.stringify(mergedDailyState.picks),
        resultsJson: JSON.stringify(results),
        status: mergedDailyState.status,
        answer,
        updatedAt: formatSqliteDateTime(mergedDailyState.updatedAt),
      })
      .onConflictDoUpdate({
        target: [
          gameDailyProgress.userId,
          gameDailyProgress.gameSlug,
          gameDailyProgress.dateKey,
        ],
        set: {
          guessesJson: JSON.stringify(mergedDailyState.picks),
          resultsJson: JSON.stringify(results),
          status: mergedDailyState.status,
          answer,
          updatedAt: formatSqliteDateTime(mergedDailyState.updatedAt),
        },
      });
  }

  const response: StackdownSyncResponse = {
    authenticated: true,
    stats: mergedStats,
    dailyState: mergedDailyState,
  };
  return NextResponse.json(response);
}
