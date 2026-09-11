import "server-only";

import { ANSWERS } from "@/lib/game/words";
import { hashString, mulberry32 } from "@/lib/game/daily";
import {
  STACK_TEMPLATE,
  WORDS_PER_PUZZLE,
  overlaps,
  type StackdownTile,
} from "./shared";

/**
 * Stackdown puzzle generator — SERVER ONLY.
 *
 * The board is the fixed 30-position STACK_TEMPLATE from shared.ts (the same
 * layout every puzzle of the original game uses). A tile is exposed iff no
 * remaining tile one layer above overlaps it (Chebyshev distance <= 1).
 *
 * Dealing simulates play: six distinct answer words are picked, then each
 * word's letters — in spelling order — are assigned to a random currently
 * removable position and conceptually lifted off the pile. Removal order is
 * therefore solvable by construction, and letters surface roughly in
 * spelling order, which is how the original reads.
 *
 * No dictionary-uniqueness pass is needed: a submission is the slot letters
 * joined in pick order compared against the target word (same as the
 * original), so decoy letters can never "solve" a word accidentally.
 */

/** Index of every template position directly overlapping `index` from above. */
const BLOCKED_BY: number[][] = STACK_TEMPLATE.map((position) =>
  STACK_TEMPLATE.map((upper, i) => ({ upper, i }))
    .filter(({ upper }) => overlaps(upper, position))
    .map(({ i }) => i),
);

export interface GeneratedStackdownPuzzle {
  /** Tile payload with letters — safe to ship to the client. */
  tiles: StackdownTile[];
  /** Solution words in solve order — must never leave the server. */
  words: string[];
  /** Word index per tile (same order as `tiles`) — must never leave the server. */
  tileWords: number[];
}

function shuffle<T>(rng: () => number, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function generatePuzzle(seed: number): GeneratedStackdownPuzzle {
  const rng = mulberry32(seed);
  const words = shuffle(rng, [...ANSWERS]).slice(0, WORDS_PER_PUZZLE);

  const remaining = new Set(STACK_TEMPLATE.map((_, i) => i));
  const tileWords = new Array<number>(STACK_TEMPLATE.length).fill(-1);
  const tileLetters = new Array<string>(STACK_TEMPLATE.length).fill("");

  for (let k = 0; k < words.length; k++) {
    for (const letter of words[k]) {
      // Removable = no remaining tile overlapping it from the layer above.
      const removable = [...remaining].filter((i) =>
        BLOCKED_BY[i].every((b) => !remaining.has(b)),
      );
      const pick = removable[Math.floor(rng() * removable.length)];
      tileWords[pick] = k;
      tileLetters[pick] = letter;
      remaining.delete(pick);
    }
  }

  return {
    tiles: STACK_TEMPLATE.map((position, i) => ({
      ...position,
      letter: tileLetters[i],
    })),
    words,
    tileWords,
  };
}

export function generateDailyPuzzle(dateKey: string): GeneratedStackdownPuzzle {
  return generatePuzzle(hashString(`stackdown:${dateKey}`));
}

/** Random practice seed; kept here so the route stays thin. */
export function randomPuzzleSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
