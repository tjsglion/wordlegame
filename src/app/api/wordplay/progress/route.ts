import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { formatSqliteDateTime } from "@/lib/drizzle/date-time";
import { wordplayProgress } from "@/lib/drizzle/schema";
import type { WordplayProgressPayload } from "@/games/wordplay/sync-types";

const DEFAULT_PROGRESS: WordplayProgressPayload = {
  currentLevel: 1,
  coins: 30,
  completed: {},
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isValidCompleted(
  value: unknown,
): value is Record<string, { bonus: number }> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as { bonus?: unknown }).bonus === "number" &&
      Number.isFinite((entry as { bonus: number }).bonus),
  );
}

function parsePayload(body: unknown): WordplayProgressPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const { currentLevel, coins, completed } = body as Record<string, unknown>;
  if (
    typeof currentLevel !== "number" ||
    !Number.isInteger(currentLevel) ||
    currentLevel < 1 ||
    currentLevel > 10000
  ) {
    return null;
  }
  if (
    typeof coins !== "number" ||
    !Number.isInteger(coins) ||
    coins < 0 ||
    coins > 1_000_000
  ) {
    return null;
  }
  if (!isValidCompleted(completed)) return null;
  return { currentLevel, coins, completed };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const row = await db
    .select()
    .from(wordplayProgress)
    .where(eq(wordplayProgress.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!row) {
    return NextResponse.json(DEFAULT_PROGRESS);
  }

  const response: WordplayProgressPayload = {
    currentLevel: row.currentLevel,
    coins: row.coins,
    completed: parseJson<WordplayProgressPayload["completed"]>(
      row.completedJson,
      {},
    ),
  };
  return NextResponse.json(response);
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const payload = parsePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const db = getDb();
  const updatedAt = formatSqliteDateTime();
  await db
    .insert(wordplayProgress)
    .values({
      userId,
      currentLevel: payload.currentLevel,
      coins: payload.coins,
      completedJson: JSON.stringify(payload.completed),
      updatedAt,
    })
    .onConflictDoUpdate({
      target: wordplayProgress.userId,
      set: {
        currentLevel: payload.currentLevel,
        coins: payload.coins,
        completedJson: JSON.stringify(payload.completed),
        updatedAt,
      },
    });

  return NextResponse.json(payload);
}
