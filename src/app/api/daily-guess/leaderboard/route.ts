import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { parseSqliteDateTime } from "@/lib/drizzle/date-time";
import { gameDailyProgress, users } from "@/lib/drizzle/schema";
import { todayKey } from "@/lib/game/daily";
import {
  WORDLE_SLUG,
  type DailyState,
} from "@/games/wordle/persistence";
import {
  isFinishedWordleStatus,
  type WordleLeaderboardEntry,
  type WordleLeaderboardResponse,
} from "@/games/wordle/leaderboard";
import { MAX_GUESSES } from "@/games/wordle/shared";

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

type FinishedStatus = WordleLeaderboardEntry["status"];

export async function GET() {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;
  const dateKey = todayKey();
  const db = getDb();

  const finishedFilter = and(
    eq(gameDailyProgress.gameSlug, WORDLE_SLUG),
    eq(gameDailyProgress.dateKey, dateKey),
    or(
      eq(gameDailyProgress.status, "won"),
      eq(gameDailyProgress.status, "lost"),
    ),
  );

  const rows = await db
    .select({
      userId: gameDailyProgress.userId,
      status: gameDailyProgress.status,
      guessesJson: gameDailyProgress.guessesJson,
      updatedAt: gameDailyProgress.updatedAt,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(gameDailyProgress)
    .leftJoin(users, eq(users.id, gameDailyProgress.userId))
    .where(finishedFilter);

  const rankedEntries = rows
    .map((row) => {
      if (!isFinishedWordleStatus(row.status as DailyState["status"])) {
        return null;
      }

      const guesses = parseJson<string[]>(row.guessesJson, []);

      return {
        userId: row.userId,
        name: getDisplayName(row.name, row.email),
        image: row.image,
        status: row.status as FinishedStatus,
        guessCount: guesses.length,
        updatedAt: parseSqliteDateTime(row.updatedAt),
        isCurrentUser: row.userId === currentUserId,
      } satisfies Omit<WordleLeaderboardEntry, "rank">;
    })
    .filter((entry): entry is Omit<WordleLeaderboardEntry, "rank"> => entry !== null)
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "won" ? -1 : 1;
      }
      if (left.guessCount !== right.guessCount) {
        return left.guessCount - right.guessCount;
      }
      if (left.updatedAt !== right.updatedAt) {
        return left.updatedAt - right.updatedAt;
      }
      return left.userId.localeCompare(right.userId);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const entries = rankedEntries.slice(0, 10);
  const currentUserEntry =
    currentUserId
      ? rankedEntries.find((entry) => entry.userId === currentUserId) ?? null
      : null;
  const guessDistribution = Array.from({ length: MAX_GUESSES }, () => 0);

  for (const entry of rankedEntries) {
    if (entry.status !== "won") continue;
    if (entry.guessCount < 1 || entry.guessCount > MAX_GUESSES) continue;
    guessDistribution[entry.guessCount - 1] += 1;
  }

  const response: WordleLeaderboardResponse = {
    dateKey,
    totalFinished: rankedEntries.length,
    guessDistribution,
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
