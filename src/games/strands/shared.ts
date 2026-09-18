import type { Locale } from "@/i18n/routing";

export const STRANDS_ROWS = 8;
export const STRANDS_COLUMNS = 6;
export const STRANDS_CELL_COUNT = STRANDS_ROWS * STRANDS_COLUMNS;

export interface StrandsArticleDb {
  slug: string;
  title: string;
  intro: string;
  themeAnalysis: string;
  spangramHint: string;
  wordHints: { word: string; hint: string }[];
  outro: string;
}

export interface StrandsPuzzle {
  id: string;
  theme: string;
  spangram: string;
  words: string[];
  validWords: string[];
  grid: string[][];
  article?: StrandsArticleDb | null;
  themeLabel?: string;
  spangramLabel?: string;
  wordLabels?: Partial<Record<string, string>>;
}

export interface StrandsPuzzleData {
  date: string;
  puzzle: StrandsPuzzle;
}

/** A save belongs to a concrete board, never merely to the day it was opened. */
export function getStrandsSessionKey(data: StrandsPuzzleData) {
  return `${data.date}:${data.puzzle.id}`;
}

export interface Point {
  r: number;
  c: number;
}

export interface FoundWord {
  word: string;
  path: Point[];
  isSpangram: boolean;
}

export type InteractionMode = "idle" | "dragging" | "clicking";

export interface StrandsGameState {
  foundWords: FoundWord[];
  isSpangramFound: boolean;
  hintMeter: number;
  totalHintsUsed: number;
  scoreSubmitted: boolean;
  hintCells: Point[];
  chargedWords: string[];
  justWon: boolean;
  errorPath: Point[];
  message: string | null;
}

export const BOARDGAMES_PATH: Point[] = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 2, c: 0 },
  { r: 1, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
  { r: 0, c: 5 }, { r: 1, c: 5 },
];
export const MONOPOLY_PATH: Point[] = [
  { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 5 },
  { r: 3, c: 5 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 3, c: 4 },
];
export const CHECKERS_PATH: Point[] = [
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 2 },
  { r: 3, c: 1 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 },
];
export const SORRY_PATH: Point[] = [
  { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 5, c: 5 },
];
export const CHESS_PATH: Point[] = [
  { r: 5, c: 0 }, { r: 5, c: 1 }, { r: 6, c: 0 }, { r: 7, c: 0 }, { r: 7, c: 1 },
];
export const RISK_PATH: Point[] = [
  { r: 5, c: 2 }, { r: 6, c: 1 }, { r: 7, c: 2 }, { r: 6, c: 2 },
];
export const CLUE_PATH: Point[] = [
  { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 6, c: 5 }, { r: 7, c: 5 },
];
export const LUDO_PATH: Point[] = [
  { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 7, c: 4 }, { r: 7, c: 3 },
];
export const GAME_PATH: Point[] = [
  { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 },
];
export const ROSE_PATH: Point[] = [
  { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 3, c: 3 },
];
export const LOSE_PATH: Point[] = [
  { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 1, c: 5 }, { r: 0, c: 5 },
];

export const GOLDEN_FIXTURE: StrandsPuzzleData = {
  date: "2026-09-11",
  puzzle: {
    id: "golden-fixture",
    theme: "Board games",
    spangram: "BOARDGAMES",
    words: ["MONOPOLY", "CHECKERS", "SORRY", "CHESS", "RISK", "CLUE", "LUDO"],
    validWords: ["GAME", "ROSE", "LOSE"],
    grid: [
      ["B", "O", "G", "A", "M", "E"], ["A", "D", "M", "O", "N", "S"],
      ["R", "C", "H", "L", "O", "O"], ["E", "K", "C", "E", "Y", "P"],
      ["R", "S", "S", "O", "R", "R"], ["C", "H", "R", "C", "L", "Y"],
      ["E", "I", "K", "L", "U", "U"], ["S", "S", "S", "O", "D", "E"],
    ],
    themeLabel: "Board games",
    spangramLabel: "Board games",
    wordLabels: {
      MONOPOLY: "Monopoly",
      CHECKERS: "Checkers",
      SORRY: "Sorry!",
      CHESS: "Chess",
      RISK: "Risk",
      CLUE: "Clue",
      LUDO: "Ludo",
    },
  },
};

const GOLDEN_FIXTURE_LOCALE_COPY: Record<
  Locale,
  {
    themeLabel: string;
    spangramLabel: string;
    wordLabels: Record<string, string>;
  }
> = {
  en: {
    themeLabel: "Board games",
    spangramLabel: "Board games",
    wordLabels: {
      MONOPOLY: "Monopoly",
      CHECKERS: "Checkers",
      SORRY: "Sorry!",
      CHESS: "Chess",
      RISK: "Risk",
      CLUE: "Clue",
      LUDO: "Ludo",
    },
  },
  zh: {
    themeLabel: "桌面游戏",
    spangramLabel: "桌面游戏",
    wordLabels: {
      MONOPOLY: "地产大亨",
      CHECKERS: "跳棋",
      SORRY: "Sorry! 棋",
      CHESS: "国际象棋",
      RISK: "风险棋",
      CLUE: "妙探寻凶",
      LUDO: "鲁多棋",
    },
  },
};

export function getStrandsLocaleCopy(locale: Locale) {
  return GOLDEN_FIXTURE_LOCALE_COPY[locale] ?? GOLDEN_FIXTURE_LOCALE_COPY.en;
}

export function getStrandsThemeLabel(puzzle: StrandsPuzzle) {
  return puzzle.themeLabel?.trim() || puzzle.theme;
}

export function getStrandsWordLabel(puzzle: StrandsPuzzle, word: string) {
  if (word === puzzle.spangram) {
    return puzzle.spangramLabel?.trim() || puzzle.spangram;
  }
  return puzzle.wordLabels?.[word]?.trim() || word;
}

export function pointKey({ r, c }: Point) {
  return `${r},${c}`;
}

export function isAdjacent(a: Point, b: Point) {
  return Math.abs(a.r - b.r) <= 1 && Math.abs(a.c - b.c) <= 1 && pointKey(a) !== pointKey(b);
}

export function pathWord(grid: string[][], path: Point[]) {
  return path.map(({ r, c }) => grid[r]?.[c] ?? "").join("");
}

export function pathsOverlap(first: Point[], second: Point[]) {
  const firstKeys = new Set(first.map(pointKey));
  return second.some((point) => firstKeys.has(pointKey(point)));
}

export function touchesOppositeEdges(path: Point[]) {
  return (path.some(({ c }) => c === 0) && path.some(({ c }) => c === STRANDS_COLUMNS - 1))
    || (path.some(({ r }) => r === 0) && path.some(({ r }) => r === STRANDS_ROWS - 1));
}

export function getSmoothPath(path: Point[]) {
  if (path.length === 0) return "";
  const coords = path.map(({ r, c }) => ({ x: c * 100 + 50, y: r * 100 + 50 }));
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y} L ${coords[0].x} ${coords[0].y}`;
  let result = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const next = coords[i + 1];
    const cross = (curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x);
    if (Math.abs(cross) < 0.01) {
      result += ` L ${curr.x} ${curr.y}`;
      continue;
    }
    const p1 = { x: curr.x - (curr.x - prev.x) * 0.3, y: curr.y - (curr.y - prev.y) * 0.3 };
    const p2 = { x: curr.x + (next.x - curr.x) * 0.3, y: curr.y + (next.y - curr.y) * 0.3 };
    result += ` L ${p1.x} ${p1.y} Q ${curr.x} ${curr.y}, ${p2.x} ${p2.y}`;
  }
  const last = coords[coords.length - 1];
  return `${result} L ${last.x} ${last.y}`;
}

export function validatePuzzle(data: StrandsPuzzleData) {
  const { grid, theme, spangram, words, validWords } = data.puzzle;
  const errors: string[] = [];
  if (grid.length !== STRANDS_ROWS || grid.some((row) => row.length !== STRANDS_COLUMNS)) errors.push("Grid must be 8x6");
  if (grid.some((row) => row.some((cell) => !/^[A-Z]$/.test(cell)))) errors.push("Grid must contain uppercase letters");
  const themeWordCount = theme.trim().split(/\s+/).filter(Boolean).length;
  if (themeWordCount < 1 || themeWordCount > 4) errors.push("Theme must contain 1-4 words");
  if (!/^[A-Z]{6,15}$/.test(spangram)) errors.push("Spangram must be 6-15 uppercase letters");
  if (words.length < 4 || words.length > 8 || words.some((word) => !/^[A-Z]{4,}$/.test(word))) {
    errors.push("Theme words must contain 4-8 uppercase words of at least 4 letters");
  }
  if (new Set(words).size !== words.length || words.includes(spangram)) errors.push("Theme words must be unique and exclude the spangram");
  if (validWords.some((word) => !/^[A-Z]{4,}$/.test(word))) errors.push("Valid words must be uppercase and at least 4 letters");
  if (new Set(validWords).size !== validWords.length) errors.push("Valid words must be unique");
  if (validWords.some((word) => word === spangram || words.includes(word))) errors.push("Valid words must exclude answers");
  if (spangram.length + words.reduce((total, word) => total + word.length, 0) !== STRANDS_CELL_COUNT) errors.push("Answers must total 48 letters");
  return errors;
}
