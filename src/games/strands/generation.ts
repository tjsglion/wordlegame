import { collectValidWords } from "./valid-words";
import { generateStrandsGrid, type GridGenerationOptions } from "./grid-generator";
import type { StrandsDictionary } from "./dictionary";
import { STRANDS_CELL_COUNT, validatePuzzle } from "./shared";

const MIN_THEME_WORDS = 4;
const MAX_THEME_WORDS = 8;
const MAX_COMBINATION_NODES = 100_000;

export interface StrandsCandidates {
  readonly theme: string;
  readonly spangrams: readonly string[];
  readonly words: readonly string[];
}

export interface StrandsWordSet {
  readonly spangram: string;
  readonly words: readonly string[];
}

export interface GeneratedStrandsPuzzle {
  readonly theme: string;
  readonly spangram: string;
  readonly words: string[];
  readonly validWords: string[];
  readonly grid: string[][];
}

function normalizedUnique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim().toUpperCase()))];
}

export function parseStrandsCandidates(value: unknown): StrandsCandidates | null {
  if (!isRecord(value) || typeof value.theme !== "string" || !Array.isArray(value.spangrams) || !Array.isArray(value.words)) {
    return null;
  }
  const theme = value.theme.trim();
  const themeWords = theme.split(/\s+/).filter(Boolean);
  if (themeWords.length < 1 || themeWords.length > 4) return null;
  if (!value.spangrams.every((word) => typeof word === "string") || !value.words.every((word) => typeof word === "string")) return null;
  const rawSpangrams = (value.spangrams as string[]).map((word) => word.trim());
  const rawWords = (value.words as string[]).map((word) => word.trim());
  if (rawSpangrams.some((word) => !/^[A-Z]{6,15}$/.test(word)) || rawWords.some((word) => !/^[A-Z]{4,15}$/.test(word))) {
    return null;
  }
  const spangrams = [...new Set(rawSpangrams)];
  const words = [...new Set(rawWords)];
  if (spangrams.length < 1 || spangrams.length > 5 || words.length < 15 || words.length > 30) return null;
  return { theme, spangrams, words };
}

export function findStrandsWordSets(candidates: StrandsCandidates, maxResults = 200): StrandsWordSet[] {
  const result: StrandsWordSet[] = [];
  let searchedNodes = 0;
  const spangrams = normalizedUnique(candidates.spangrams);
  const candidateWords = normalizedUnique(candidates.words);
  for (const spangram of spangrams) {
    const target = STRANDS_CELL_COUNT - spangram.length;
    const available = candidateWords
      .filter((word) => word !== spangram)
      .sort((left, right) => right.length - left.length || left.localeCompare(right));
    const search = (start: number, chosen: string[], length: number) => {
      searchedNodes += 1;
      if (searchedNodes > MAX_COMBINATION_NODES || result.length >= maxResults || length > target || chosen.length > MAX_THEME_WORDS) return;
      const slots = MAX_THEME_WORDS - chosen.length;
      const largestRemaining = available
        .slice(start, start + slots)
        .reduce((total, word) => total + word.length, 0);
      if (length + largestRemaining < target) return;
      if (length === target) {
        if (chosen.length >= MIN_THEME_WORDS && chosen.length <= MAX_THEME_WORDS) {
          result.push({ spangram, words: [...chosen] });
        }
        return;
      }
      for (let index = start; index < available.length; index += 1) {
        const word = available[index];
        if (length + word.length > target) continue;
        search(index + 1, [...chosen, word], length + word.length);
      }
    };
    search(0, [], 0);
  }
  return result;
}

export function buildGeneratedStrandsPuzzle(
  candidates: StrandsCandidates,
  dictionary: StrandsDictionary,
  gridOptions: GridGenerationOptions = {},
): GeneratedStrandsPuzzle | null {
  for (const choice of findStrandsWordSets(candidates)) {
    const solution = generateStrandsGrid(
      [
        { text: choice.spangram, isSpangram: true },
        ...choice.words.map((text) => ({ text, isSpangram: false })),
      ],
      gridOptions,
    );
    if (!solution) continue;
    const validWords = collectValidWords(solution.grid, dictionary, [choice.spangram, ...choice.words]);
    const puzzle: GeneratedStrandsPuzzle = {
      theme: candidates.theme,
      spangram: choice.spangram,
      words: [...choice.words],
      validWords,
      grid: solution.grid,
    };
    if (validatePuzzle({ date: "generated", puzzle: { id: "generated", ...puzzle } }).length === 0) return puzzle;
  }
  return null;
}

export function cosineSimilarity(first: readonly number[], second: readonly number[]) {
  if (first.length === 0 || first.length !== second.length) return null;
  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;
  for (let index = 0; index < first.length; index += 1) {
    const left = first[index];
    const right = second[index];
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    dot += left * right;
    firstMagnitude += left * left;
    secondMagnitude += right * right;
  }
  if (firstMagnitude === 0 || secondMagnitude === 0) return null;
  return dot / Math.sqrt(firstMagnitude * secondMagnitude);
}

export function isNearDuplicateTopic(
  topic: string,
  embedding: readonly number[] | null,
  history: readonly { topic: string; embedding: readonly number[] | null }[],
  threshold = 0.85,
) {
  const normalized = topic.trim().toLocaleLowerCase("en-US");
  return history.some((entry) =>
    entry.topic.trim().toLocaleLowerCase("en-US") === normalized
    || (embedding !== null && entry.embedding !== null && (cosineSimilarity(embedding, entry.embedding) ?? -1) >= threshold),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
