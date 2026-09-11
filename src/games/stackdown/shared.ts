/**
 * Stackdown shared contract — safe for both client and server bundles.
 *
 * The client receives only tile positions + letters; the solution words and
 * the tile -> word mapping stay on the server (see puzzle.ts).
 *
 * Geometry: tiles sit on a 9x9 half-step grid across 4 layers. A tile is
 * exposed (pickable) iff no remaining tile sits one layer above within
 * Chebyshev distance 1 — the same rule the original game uses
 * (`overlappedBy` in its bundle). The client can compute exposure locally
 * from positions alone, so no game state ever needs the server mid-word.
 */

export const WORD_LENGTH = 5;
export const WORDS_PER_PUZZLE = 6;
export const GRID_SIZE = 9;
/** Hints per word: one clue reveal (enforced client-side, clamped by sync). */
export const MAX_HINTS_PER_WORD = 1;
/** One star maps to each hidden word; a six-word round therefore has six stars. */
export const STAR_COUNT = WORDS_PER_PUZZLE;
/** Tiles per puzzle: one per letter of every solution word. */
export const TILE_COUNT = WORD_LENGTH * WORDS_PER_PUZZLE;

export type GameMode = "daily" | "practice";

/** Score stars: 6 minus hints used, floor of 1. Shared client/server. */
export function stackdownStars(totalHints: number): number {
  return Math.max(STAR_COUNT - totalHints, 1);
}

export interface StackdownTile {
  /** Integer grid position, 0..8. */
  x: number;
  y: number;
  /** Layer, 0 (bottom)..3 (top). */
  z: number;
  letter: string;
}

/**
 * Fixed pile template shared by every puzzle: perimeter ring, two middle
 * rings, top cluster — 10/8/8/4 tiles from bottom to top. Positions ship to
 * the client in the tile payload, so this stays client-safe; only the letters
 * and word mapping are secret.
 */
export const STACK_TEMPLATE: ReadonlyArray<Pick<StackdownTile, "x" | "y" | "z">> =
  [
    // layer 0 — outer ring (10)
    ...[ [2, 0], [6, 0], [0, 2], [8, 2], [0, 4], [8, 4], [0, 6], [8, 6], [2, 8], [6, 8] ].map(
      ([x, y]) => ({ x, y, z: 0 }),
    ),
    // layer 1 — (8)
    ...[ [3, 1], [5, 1], [1, 3], [7, 3], [1, 5], [7, 5], [3, 7], [5, 7] ].map(
      ([x, y]) => ({ x, y, z: 1 }),
    ),
    // layer 2 — (8)
    ...[ [2, 2], [4, 2], [6, 2], [2, 4], [6, 4], [2, 6], [4, 6], [6, 6] ].map(
      ([x, y]) => ({ x, y, z: 2 }),
    ),
    // layer 3 — top cluster (4)
    ...[ [3, 3], [5, 3], [3, 5], [5, 5] ].map(([x, y]) => ({ x, y, z: 3 })),
  ];

export interface StackdownPuzzlePayload {
  tiles: StackdownTile[];
}

export interface StackdownStartResponse extends StackdownPuzzlePayload {
  dateKey?: string;
  token?: string;
}

export interface StackdownGuessRequest {
  action: "guess";
  mode: GameMode;
  token?: string;
  /** Words solved so far, in order — the server checks this is a true prefix. */
  solved: string[];
  /** Picked tile ids (indexes into the tile list) in pick order. */
  tiles: number[];
}

export interface StackdownGuessResponse {
  ok: boolean;
  finished: boolean;
}

export interface StackdownHintRequest {
  action: "hint";
  mode: GameMode;
  token?: string;
  solved: string[];
}

export interface StackdownHintResponse {
  /** Meaning clue for the current word (crossword-style). */
  clue: string;
}

export type StackdownRequest =
  | { action: "start-practice" }
  | StackdownGuessRequest
  | StackdownHintRequest;

/** True when `upper` (one layer up) physically overlaps `tile`. */
export function overlaps(
  upper: Pick<StackdownTile, "x" | "y" | "z">,
  tile: Pick<StackdownTile, "x" | "y" | "z">,
): boolean {
  return (
    upper.z === tile.z + 1 &&
    Math.abs(upper.x - tile.x) <= 1 &&
    Math.abs(upper.y - tile.y) <= 1
  );
}
