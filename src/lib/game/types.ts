import type { Locale } from "@/i18n/routing";

export type GameStatus = "available" | "coming-soon";

/** Registered game slugs — keep in sync with `games` in src/games/registry.ts. */
export type GameSlug =
  | "wordle"
  | "stackdown"
  | "strands"
  | "wordplay"
  | "word-search"
  | "crossword"
  | "word-connect";

/** A localized string for every supported locale. */
export type LocalizedText = Record<Locale, string>;

export interface GameDefinition {
  /** Internal registry slug; public paths may remap via `public-slugs.ts`. */
  slug: GameSlug;
  status: GameStatus;
  /** Free-form tags shown on the game card, e.g. ["daily", "letters"]. */
  tags: string[];
  title: LocalizedText;
  description: LocalizedText;
}

/** Generic per-game stats stored in localStorage. */
export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

export const emptyStats: GameStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};
