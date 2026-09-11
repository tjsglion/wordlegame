import { after, NextResponse } from "next/server";
import { todayKey } from "@/lib/game/daily";
import {
  generateDailyPuzzle,
  generatePuzzle,
  randomPuzzleSeed,
  type GeneratedStackdownPuzzle,
} from "@/games/stackdown/puzzle";
import {
  signPracticeToken,
  verifyPracticeToken,
} from "@/games/stackdown/token";
import {
  isValidPickShape,
  replayWordPicks,
} from "@/games/stackdown/server";
import {
  backfillClueForWord,
  clueForWord,
} from "@/games/stackdown/clues";
import {
  WORD_LENGTH,
  WORDS_PER_PUZZLE,
  type StackdownGuessRequest,
  type StackdownGuessResponse,
  type StackdownHintRequest,
  type StackdownHintResponse,
  type StackdownRequest,
  type StackdownStartResponse,
} from "@/games/stackdown/shared";

/**
 * Server-authoritative Stackdown API.
 *
 * - GET: today's daily puzzle (UTC date key) — tile positions + letters only.
 * - POST { action: "start-practice" }: a random-seeded practice puzzle plus
 *   an HMAC-signed token that pins the seed for later calls.
 * - POST { action: "guess" }: accepts the submission only when every picked
 *   tile is a real, still-present, currently exposed tile of the cached
 *   puzzle and the joined letters (in pick order) form the next solution
 *   word after the (verified) solved prefix.
 * - POST { action: "hint" }: returns the current word's meaning clue
 *   (crossword-style) from the word_clues table. Idempotent per word — the
 *   per-word limit lives client-side and in the sync clamp.
 *
 * The solution words never leave the server; puzzles are deterministic per
 * seed/date, so validation regenerates instead of storing state. Generated
 * puzzles are memoized per process.
 */

const CACHE_LIMIT = 64;
const puzzleCache = new Map<string, GeneratedStackdownPuzzle>();

function cachedPuzzle(
  key: string,
  build: () => GeneratedStackdownPuzzle,
): GeneratedStackdownPuzzle {
  const hit = puzzleCache.get(key);
  if (hit) return hit;
  const puzzle = build();
  if (puzzleCache.size >= CACHE_LIMIT) {
    const oldest = puzzleCache.keys().next().value;
    if (oldest !== undefined) puzzleCache.delete(oldest);
  }
  puzzleCache.set(key, puzzle);
  return puzzle;
}

function isWordShape(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === WORD_LENGTH &&
    /^[a-z]+$/.test(value)
  );
}

/** Never fail the hint flow just because clue content is missing. */
function fallbackClue(word: string): string {
  return `Starts with "${word[0].toUpperCase()}".`;
}

function scheduleClueBackfill(word: string): void {
  try {
    after(async () => {
      await backfillClueForWord(word);
    });
  } catch {
    // Direct function calls in tests have no request scope, so `after()`
    // cannot register background work there.
  }
}

/** Resolves the puzzle for the request, or a Response describing the error. */
async function resolvePuzzle(
  body: StackdownGuessRequest | StackdownHintRequest,
): Promise<GeneratedStackdownPuzzle | NextResponse> {
  if (body.mode === "daily") {
    return cachedPuzzle(`daily:${todayKey()}`, () =>
      generateDailyPuzzle(todayKey()),
    );
  }
  if (body.mode === "practice" && typeof body.token === "string") {
    const seed = await verifyPracticeToken(body.token);
    if (seed === null) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }
    return cachedPuzzle(`practice:${seed}`, () => generatePuzzle(seed));
  }
  return NextResponse.json({ error: "bad request" }, { status: 400 });
}

/** The solved list must be a true prefix of the solution, in order. */
function solvedPrefixIndex(
  puzzle: GeneratedStackdownPuzzle,
  solved: unknown,
): number | null {
  if (!Array.isArray(solved) || solved.length > WORDS_PER_PUZZLE) return null;
  if (!solved.every(isWordShape)) return null;
  for (let i = 0; i < solved.length; i++) {
    if (solved[i] !== puzzle.words[i]) return null;
  }
  return solved.length;
}

export async function GET() {
  const dateKey = todayKey();
  const puzzle = cachedPuzzle(`daily:${dateKey}`, () =>
    generateDailyPuzzle(dateKey),
  );
  const response: StackdownStartResponse = {
    dateKey,
    tiles: puzzle.tiles,
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  let body: StackdownRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (body.action === "start-practice") {
    const seed = randomPuzzleSeed();
    const puzzle = cachedPuzzle(`practice:${seed}`, () => generatePuzzle(seed));
    const response: StackdownStartResponse = {
      tiles: puzzle.tiles,
      token: await signPracticeToken(seed),
    };
    return NextResponse.json(response);
  }

  if (body.action === "guess") {
    const puzzle = await resolvePuzzle(body);
    if (puzzle instanceof NextResponse) return puzzle;

    const solvedCount = solvedPrefixIndex(puzzle, body.solved);
    if (solvedCount === null) {
      return NextResponse.json({ error: "out of sync" }, { status: 409 });
    }
    if (solvedCount >= WORDS_PER_PUZZLE) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    // Verify each picked tile against the cached puzzle: in range, still
    // present, and currently exposed (no remaining tile overlapping it from
    // the layer above). Violations mean the client drifted or is cheating —
    // 409 without revealing what was wrong.
    const picks = body.tiles;
    if (!isValidPickShape(picks, puzzle.tiles.length)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    // Tiles of already-solved words are gone; in-flight picks leave as they
    // are verified, which is what exposes later picks of the same word.
    const remaining = new Set(
      puzzle.tiles
        .map((_, i) => i)
        .filter((i) => puzzle.tileWords[i] >= solvedCount),
    );
    const word = replayWordPicks(puzzle, remaining, picks);
    if (word === null) {
      return NextResponse.json({ error: "out of sync" }, { status: 409 });
    }

    const ok = word === puzzle.words[solvedCount];
    const response: StackdownGuessResponse = {
      ok,
      finished: ok && solvedCount + 1 === WORDS_PER_PUZZLE,
    };
    return NextResponse.json(response);
  }

  if (body.action === "hint") {
    const puzzle = await resolvePuzzle(body);
    if (puzzle instanceof NextResponse) return puzzle;

    const solvedCount = solvedPrefixIndex(puzzle, body.solved);
    if (solvedCount === null) {
      return NextResponse.json({ error: "out of sync" }, { status: 409 });
    }
    if (solvedCount >= WORDS_PER_PUZZLE) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const word = puzzle.words[solvedCount];
    let clue: string | null = null;
    try {
      clue = await clueForWord(word);
    } catch (error) {
      console.error(`[stackdown-clue] lookup failed for "${word}"`, error);
      clue = null;
    }
    if (clue === null) {
      scheduleClueBackfill(word);
    }
    const response: StackdownHintResponse = {
      clue: clue ?? fallbackClue(word),
    };
    return NextResponse.json(response);
  }

  return NextResponse.json({ error: "bad request" }, { status: 400 });
}
