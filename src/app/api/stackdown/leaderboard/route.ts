import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { parseSqliteDateTime } from "@/lib/drizzle/date-time";
import { gameDailyProgress, users } from "@/lib/drizzle/schema";
import { todayKey } from "@/lib/game/daily";
import {
  STACKDOWN_SLUG,
  STAR_COUNT,
  type StackdownWordTime,
} from "@/games/stackdown/persistence";
import {
  rankStackdownEntries,
  type StackdownLeaderboardEntry,
  type StackdownLeaderboardResponse,
} from "@/games/stackdown/leaderboard";
import { stackdownStars } from "@/games/stackdown/shared";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getDisplayName(name: string | null, email: string | null): string {
  if (name?.trim()) return name.trim();
  if (email?.includes("@")) return email.split("@")[0];
  return "Player";
}

export async function GET() {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;
  const dateKey = todayKey();
  const db = getDb();

  const rows = await db
    .select({
      userId: gameDailyProgress.userId,
      resultsJson: gameDailyProgress.resultsJson,
      updatedAt: gameDailyProgress.updatedAt,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(gameDailyProgress)
    .leftJoin(users, eq(users.id, gameDailyProgress.userId))
    .where(
      and(
        eq(gameDailyProgress.gameSlug, STACKDOWN_SLUG),
        eq(gameDailyProgress.dateKey, dateKey),
        eq(gameDailyProgress.status, "won"),
      ),
    );

  const rankedEntries = rankStackdownEntries(
    rows.map((row) => {
      const results = parseJson<{ wordTimes: StackdownWordTime[]; elapsedMs: number }>(
        row.resultsJson,
        { wordTimes: [], elapsedMs: 0 },
      );
      const totalHints = results.wordTimes.reduce(
        (sum, word) => sum + (Number(word?.hints) || 0),
        0,
      );

      return {
        userId: row.userId,
        name: getDisplayName(row.name, row.email),
        image: row.image,
        stars: stackdownStars(totalHints),
        timeMs: Math.max(0, Number(results.elapsedMs) || 0),
        updatedAt: parseSqliteDateTime(row.updatedAt),
        isCurrentUser: row.userId === currentUserId,
      } satisfies Omit<StackdownLeaderboardEntry, "rank">;
    }),
  ).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const entries = rankedEntries.slice(0, 10);
  const currentUserEntry =
    currentUserId
      ? rankedEntries.find((entry) => entry.userId === currentUserId) ?? null
      : null;
  const starDistribution = Array.from({ length: STAR_COUNT }, () => 0);

  for (const entry of rankedEntries) {
    if (entry.stars < 1 || entry.stars > STAR_COUNT) continue;
    starDistribution[entry.stars - 1] += 1;
  }

  const response: StackdownLeaderboardResponse = {
    dateKey,
    totalFinished: rankedEntries.length,
    starDistribution,
    entries,
    currentUserEntry,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": currentUserId
        ? "private, max-age=15, stale-while-revalidate=30"
        : "public, max-age=30, stale-while-revalidate=60",
      Vary: "Cookie",
    },
  });
}
