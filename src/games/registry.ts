import type { ComponentType } from "react";
import type { GameDefinition } from "@/lib/game/types";

/**
 * Central game registry. To add a game:
 * 1. Create a self-contained directory under src/games/<slug>/.
 * 2. Add an entry here (status "coming-soon" until it is playable) and its
 *    slug to `GameSlug` in src/lib/game/types.ts.
 * 3. Add its client component loader to `gameLoaders` below.
 * Per-game UI is also wired by slug in three more places: the stats modal and
 * help content in src/components/layout/site-header.tsx +
 * src/components/help/help-modal.tsx, and the SEO help section in
 * src/app/[locale]/game-page.tsx.
 */
export const games: GameDefinition[] = [
  {
    slug: "wordle",
    status: "available",
    tags: ["daily", "letters"],
    title: { zh: "Wordle 猜单词", en: "Wordle" },
    description: {
      zh: "6 次猜中每日 5 字母单词。",
      en: "Guess the daily 5-letter word in 6 tries.",
    },
  },
  {
    slug: "stackdown",
    status: "available",
    tags: ["daily", "letters"],
    title: { zh: "单词堆栈", en: "Stackdown" },
    description: {
      zh: "点击堆栈顶端暴露的字母，依次拼出所有 5 字母单词来清空堆栈。",
      en: "Pick exposed tiles off the stack to spell every hidden 5-letter word.",
    },
  },
  {
    slug: "strands",
    status: "available",
    tags: ["daily", "grid", "words"],
    title: { zh: "连线寻词", en: "Strands" },
    description: {
      zh: "在字母网格中连线找出主题词和贯穿全局的主题词。",
      en: "Find themed words and the spangram in a letter grid.",
    },
  },
  {
    slug: "wordplay",
    status: "available",
    tags: ["levels", "grid", "letters"],
    title: { zh: "描词闯关", en: "Word Trail" },
    description: {
      zh: "在字母棋盘上描出所有隐藏的单词，逐关解锁更大的棋盘。",
      en: "Trace every hidden word on the letter board to unlock bigger grids.",
    },
  },
  {
    slug: "word-search",
    status: "coming-soon",
    tags: ["grid", "letters"],
    title: { zh: "单词搜索", en: "Word Search" },
    description: {
      zh: "在字母网格中找出隐藏的单词。",
      en: "Find hidden words in a letter grid.",
    },
  },
  {
    slug: "crossword",
    status: "coming-soon",
    tags: ["grid", "clues"],
    title: { zh: "填字游戏", en: "Crossword" },
    description: {
      zh: "根据提示填入纵横交错的单词。",
      en: "Fill in the intersecting words from the clues.",
    },
  },
  {
    slug: "word-connect",
    status: "coming-soon",
    tags: ["letters", "combo"],
    title: { zh: "连线组词", en: "Word Connect" },
    description: {
      zh: "连线字母拼出所有可能的单词。",
      en: "Connect letters to spell every possible word.",
    },
  },
];

export function getGame(slug: string): GameDefinition | undefined {
  return games.find((game) => game.slug === slug);
}

/**
 * Lazy client-component loaders, keyed by game slug. Declared here (next to
 * the metadata) so adding a game only touches this file; the actual
 * `next/dynamic` wrapping happens in the client-side game loader.
 */
export const gameLoaders: Record<
  string,
  () => Promise<{ default: ComponentType<Record<string, unknown>> }>
> = {
  wordle: () => import("@/games/wordle/wordle-game"),
  stackdown: () => import("@/games/stackdown/stackdown-game"),
  strands: () => import("@/games/strands/strands-game"),
  wordplay: () => import("@/games/wordplay/wordplay-game"),
};
