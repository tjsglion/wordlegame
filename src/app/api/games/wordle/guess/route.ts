import { NextResponse } from "next/server";
import { pickDaily, todayKey } from "@/lib/game/daily";
import { ALLOWED_GUESSES, ANSWERS } from "@/games/wordle/words";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  evaluateGuess,
  type GuessRequest,
  type GuessResponse,
  type LetterState,
} from "@/games/wordle/shared";

/**
 * Server-authoritative Wordle evaluation.
 *
 * The answer never leaves the server while a round is in progress:
 * - daily: the answer is derived deterministically from the UTC date (same
 *   seed logic as src/lib/game/daily.ts), no token needed.
 * - practice: `start` (a request without token) picks a random answer and
 *   returns it as an HMAC-signed token (base64url(payload).base64url(sig),
 *   keyed with AUTH_SECRET via Web Crypto — Workers-compatible). Subsequent
 *   guesses must carry that token; a tampered or expired token gets a 401.
 * The answer is only included in the response once the round is finished.
 */

const SLUG = "wordle";
/** Practice rounds are casual; a day is plenty. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(authSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function unbase64url(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface PracticePayload {
  /** answer */
  a: string;
  /** issued at, epoch ms */
  iat: number;
}

async function signPracticeToken(answer: string): Promise<string> {
  const payload: PracticePayload = { a: answer, iat: Date.now() };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${base64url(payloadBytes)}.${base64url(signature)}`;
}

/** Returns the answer, or null when the token is forged, malformed, or stale. */
async function verifyPracticeToken(token: string): Promise<string | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadPart = token.slice(0, dot);
  const signaturePart = token.slice(dot + 1);

  let payloadBytes: Uint8Array;
  let signature: Uint8Array;
  try {
    payloadBytes = unbase64url(payloadPart);
    signature = unbase64url(signaturePart);
  } catch {
    return null;
  }

  const key = await hmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature as BufferSource,
    payloadBytes as BufferSource,
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(payloadBytes),
    ) as PracticePayload;
    if (typeof payload.a !== "string" || !ANSWERS.includes(payload.a)) {
      return null;
    }
    if (typeof payload.iat !== "number" || Date.now() - payload.iat > TOKEN_TTL_MS) {
      return null;
    }
    return payload.a;
  } catch {
    return null;
  }
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
    answer = pickDaily(ANSWERS, todayKey(), SLUG);
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
    // The answer is revealed only once the round is over.
    ...(status !== "playing" ? { answer } : {}),
    ...(freshToken ? { token: freshToken } : {}),
  };
  return NextResponse.json(response);
}
