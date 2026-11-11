import { NextResponse } from "next/server";
import { todayKey } from "@/lib/game/daily";
import { ALLOWED_GUESSES, ANSWERS } from "@/lib/game/words";
import { resolveDailyAnswer } from "@/games/wordle/server";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  evaluateGuess,
  type GuessRequest,
  type GuessResponse,
  type LetterState,
} from "@/games/wordle/shared";
import { signPayload, verifyPayload } from "@/lib/game/token";

/**
 * Server-authoritative Daily Guess evaluation.
 *
 * The answer never leaves the server while a round is in progress:
 * - daily: prefer the seeded `wordle_daily_puzzles` row for the UTC date;
 *   if the table has no row (or the DB is temporarily unavailable), fall
 *   back to the deterministic local picker so the game still works.
 * - practice: `start` (a request without token) picks a random answer and
 *   returns it as an HMAC-signed token (base64url(payload).base64url(sig),
 *   keyed with AUTH_SECRET via Web Crypto). Subsequent guesses must carry
 *   that token; a tampered or expired token gets a 401.
 * The answer is only included in the response once the round is finished.
 */

/** Practice rounds are casual; a day is plenty. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface PracticePayload {
  /** answer */
  a: string;
  /** issued at, epoch ms */
  iat: number;
}

async function signPracticeToken(answer: string): Promise<string> {
  return signPayload({ a: answer });
}

/** Returns the answer, or null when the token is forged, malformed, or stale. */
async function verifyPracticeToken(token: string): Promise<string | null> {
  const payload = await verifyPayload<PracticePayload>(token, TOKEN_TTL_MS);
  if (
    payload === null ||
    typeof payload.a !== "string" ||
    !ANSWERS.includes(payload.a)
  ) {
    return null;
  }
  return payload.a;
}

function randomAnswer(): string {
  return ANSWERS[crypto.getRandomValues(new Uint32Array(1))[0] % ANSWERS.length];
}

export async function POST(request: Request) {
  let body: GuessRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { mode } = body;
  const guesses = Array.isArray(body.guesses) ? body.guesses : [];

  let answer: string;
  let freshToken: string | undefined;

  if (mode === "daily") {
    answer = await resolveDailyAnswer(todayKey());
  } else if (mode === "practice") {
    if (body.token) {
      const verified = await verifyPracticeToken(body.token);
      if (!verified) {
        return NextResponse.json({ error: "invalid token" }, { status: 401 });
      }
      answer = verified;
    } else {
      // No token = start a new practice round.
      answer = randomAnswer();
      freshToken = await signPracticeToken(answer);
    }
  } else {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (
    guesses.length > MAX_GUESSES ||
    guesses.some(
      (g) =>
        typeof g !== "string" ||
        g.length !== WORD_LENGTH ||
        !ALLOWED_GUESSES.has(g),
    )
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const results: LetterState[][] = guesses.map((g) => evaluateGuess(g, answer));
  const won = guesses[guesses.length - 1] === answer;
  const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";

  const response: GuessResponse = {
    results,
    status,
    ...(status !== "playing" ? { answer } : {}),
    ...(freshToken ? { token: freshToken } : {}),
  };
  return NextResponse.json(response);
}
