import {
  type FoundWord,
  type Point,
  type StrandsPuzzle,
  isAdjacent,
  pathWord,
  pointKey,
  touchesOppositeEdges,
} from "./shared";
import { findPathForAnswer, findPathForWord, getStrandsSolutionPaths } from "./solution-paths";
export { findPathForWord } from "./solution-paths";

export interface SubmissionInput {
  puzzle: StrandsPuzzle;
  foundWords: FoundWord[];
  chargedWords: string[];
  hintMeter: number;
}

export type SubmissionResult =
  | { kind: "found"; foundWord: FoundWord; isWin: boolean }
  | { kind: "charged"; word: string; hintMeter: number }
  | { kind: "already-counted" | "already-found" | "spangram-edge" | "too-short" | "unknown"; errorPath: Point[] };

export interface HintInput {
  puzzle: StrandsPuzzle;
  foundWords: FoundWord[];
  hintMeter: number;
  totalHintsUsed: number;
}

export type HintResult =
  | { kind: "hint"; word: string; path: Point[]; hintMeter: 0; totalHintsUsed: number }
  | { kind: "no-hint" | "meter-not-full"; hintMeter: number; totalHintsUsed: number };

export function submitPath(input: SubmissionInput, path: Point[]): SubmissionResult {
  const { puzzle, foundWords } = input;
  if (!isValidPath(path, foundWords)) return { kind: "unknown", errorPath: path };
  const word = pathWord(puzzle.grid, path);
  const reverse = word.split("").reverse().join("");
  const isSpangram = word === puzzle.spangram || reverse === puzzle.spangram;
  const themeWord = puzzle.words.includes(word) ? word : puzzle.words.includes(reverse) ? reverse : null;
  const canonicalWord = isSpangram ? puzzle.spangram : themeWord ?? word;
  const alreadyFound = foundWords.some((found) => found.word === canonicalWord);
  const validSpangram = isSpangram && touchesOppositeEdges(path);

  if ((themeWord !== null || validSpangram) && !alreadyFound) {
    const foundWord = { word: canonicalWord, path, isSpangram };
    return { kind: "found", foundWord, isWin: foundWords.length + 1 === puzzle.words.length + 1 };
  }
  if (alreadyFound) return { kind: "already-found", errorPath: path };
  if (isSpangram) return { kind: "spangram-edge", errorPath: path };
  if (puzzle.validWords.includes(word)) {
    if (input.chargedWords.includes(word)) return { kind: "already-counted", errorPath: path };
    return { kind: "charged", word, hintMeter: Math.min(3, input.hintMeter + 1) };
  }
  return { kind: word.length < 4 ? "too-short" : "unknown", errorPath: path };
}

function isValidPath(path: Point[], foundWords: FoundWord[]) {
  const occupied = new Set(foundWords.flatMap(({ path: foundPath }) => foundPath.map(pointKey)));
  const visited = new Set<string>();
  return path.length > 0 && path.every((point, index) => {
    const key = pointKey(point);
    const inBounds = point.r >= 0 && point.r < 8 && point.c >= 0 && point.c < 6;
    const valid = inBounds && !visited.has(key) && !occupied.has(key) && (index === 0 || isAdjacent(path[index - 1], point));
    visited.add(key);
    return valid;
  });
}

export function findHintPath(puzzle: StrandsPuzzle, foundWords: FoundWord[], candidates = [...puzzle.words, puzzle.spangram]) {
  const found = new Set(foundWords.map(({ word }) => word));
  const blocked = new Set(foundWords.flatMap(({ path }) => path.map(pointKey)));
  const solutions = getStrandsSolutionPaths(puzzle);
  for (const word of candidates) {
    if (found.has(word)) continue;
    const cached = solutions?.get(word);
    const path = !cached || cached.some((point) => blocked.has(pointKey(point)))
      ? findPathForAnswer(word, puzzle.grid, blocked, word === puzzle.spangram)
      : cached;
    if (path) return { word, path: [...path] };
  }
  return null;
}

export function useHint(input: HintInput, random = Math.random): HintResult {
  if (input.hintMeter < 3) return { kind: "meter-not-full", hintMeter: input.hintMeter, totalHintsUsed: input.totalHintsUsed };
  const candidates = shuffle([...input.puzzle.words, input.puzzle.spangram], random);
  const hint = findHintPath(input.puzzle, input.foundWords, candidates);
  if (!hint) return { kind: "no-hint", hintMeter: input.hintMeter, totalHintsUsed: input.totalHintsUsed };
  return { kind: "hint", ...hint, hintMeter: 0, totalHintsUsed: input.totalHintsUsed + 1 };
}


function shuffle<T>(items: T[], random: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
