import "server-only";

/**
 * HMAC-signed tokens (base64url(payload).base64url(sig), keyed with
 * AUTH_SECRET via Web Crypto — Workers-compatible). Shared by the games'
 * practice modes: the signer stamps `iat`, verification enforces a TTL.
 * Callers own their payload shape and validate its fields after verify.
 */

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

/** Signs `payload` (JSON) with a fresh `iat` timestamp. */
export async function signPayload<T extends Record<string, unknown>>(
  payload: T,
): Promise<string> {
  const payloadBytes = encoder.encode(
    JSON.stringify({ ...payload, iat: Date.now() }),
  );
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${base64url(payloadBytes)}.${base64url(signature)}`;
}

/** Returns the payload, or null when the token is forged/malformed/stale. */
export async function verifyPayload<T extends { iat: number }>(
  token: string,
  ttlMs: number,
): Promise<T | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadPart = token.slice(0, dot);
  const signaturePart = token.slice(dot + 1);

  let payloadBytes: Uint8Array;
  let signatureBytes: Uint8Array;
  try {
    payloadBytes = unbase64url(payloadPart);
    signatureBytes = unbase64url(signaturePart);
  } catch {
    return null;
  }

  const key = await hmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    payloadBytes as BufferSource,
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(payloadBytes),
    ) as T;
    if (typeof payload.iat !== "number" || Date.now() - payload.iat > ttlMs) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
