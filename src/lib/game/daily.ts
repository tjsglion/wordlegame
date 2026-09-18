/**
 * Deterministic daily-puzzle helpers.
 *
 * The date key is derived from UTC so every player worldwide gets the same
 * puzzle on the same day ("全服同题"), regardless of local time zone.
 */

/** "YYYY-MM-DD" in UTC. */
export function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Stable UTC timestamp for date-scoped identifiers. */
export function utcDateKeyToEpochMillis(dateKey: string): number {
  return Date.parse(`${dateKey}T00:00:00.000Z`);
}

/** xmur3 string hash -> 32-bit unsigned seed. */
export function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/** mulberry32 PRNG: fast, seedable, good enough for game content. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded RNG for a given day. `salt` namespaces it per game/feature. */
function dailyRng(dateKey: string, salt = ""): () => number {
  return mulberry32(hashString(`${salt}:${dateKey}`));
}

/** Pick a deterministic item for the given day, same for all players. */
export function pickDaily<T>(
  items: readonly T[],
  dateKey: string = todayKey(),
  salt = "",
): T {
  const rng = dailyRng(dateKey, salt);
  return items[Math.floor(rng() * items.length)];
}
