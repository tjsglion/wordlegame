import "server-only";

import { signPayload, verifyPayload } from "@/lib/game/token";

/**
 * HMAC-signed practice tokens (see lib/game/token.ts). The payload carries
 * the puzzle seed so practice rounds stay server-verifiable without shipping
 * the solution to the client.
 */

/** Practice rounds are casual; a day is plenty. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface PracticePayload {
  /** puzzle seed */
  s: number;
  /** issued at, epoch ms */
  iat: number;
}

export async function signPracticeToken(seed: number): Promise<string> {
  return signPayload({ s: seed });
}

/** Returns the puzzle seed, or null when the token is forged/malformed/stale. */
export async function verifyPracticeToken(
  token: string,
): Promise<number | null> {
  const payload = await verifyPayload<PracticePayload>(token, TOKEN_TTL_MS);
  if (
    payload === null ||
    typeof payload.s !== "number" ||
    !Number.isInteger(payload.s)
  ) {
    return null;
  }
  return payload.s >>> 0;
}
