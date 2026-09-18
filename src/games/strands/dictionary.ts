export const STRANDS_DICTIONARY_TARGET_SIZE = 8_000;

export type WordFrequency = {
  readonly word: string;
  readonly count: number;
};

export type CommonDictionarySources = {
  readonly dictionary: readonly string[];
  readonly frequencies: readonly WordFrequency[];
  readonly blacklist: readonly string[];
};

export type StrandsDictionary = {
  readonly words: ReadonlySet<string>;
  readonly prefixes: ReadonlySet<string>;
};

const WORD_PATTERN = /^[a-z]{4,15}$/;
const UPPERCASE_WORD_PATTERN = /^[A-Z]{4,15}$/;

export function buildCommonDictionaryWords(
  { dictionary, frequencies, blacklist }: CommonDictionarySources,
  targetSize = STRANDS_DICTIONARY_TARGET_SIZE,
): string[] {
  if (!Number.isSafeInteger(targetSize) || targetSize <= 0) {
    throw new Error("targetSize must be a positive safe integer");
  }

  const baseWords = new Set(dictionary.map((word) => word.toLowerCase()));
  const blockedWords = new Set(blacklist.map((word) => word.toLowerCase()));
  const counts = new Map<string, number>();

  for (const { word: rawWord, count } of frequencies) {
    const word = rawWord.toLowerCase();
    if (
      rawWord !== word ||
      !Number.isFinite(count) ||
      !WORD_PATTERN.test(word) ||
      !baseWords.has(word) ||
      blockedWords.has(word)
    ) {
      continue;
    }

    const previousCount = counts.get(word);
    if (previousCount === undefined || count > previousCount) {
      counts.set(word, count);
    }
  }

  if (counts.size < targetSize) {
    throw new Error(`Expected at least ${targetSize}`);
  }

  return [...counts]
    .sort(([leftWord, leftCount], [rightWord, rightCount]) =>
      rightCount - leftCount || (leftWord < rightWord ? -1 : leftWord > rightWord ? 1 : 0),
    )
    .slice(0, targetSize)
    .map(([word]) => word.toUpperCase());
}

export function createStrandsDictionary(words: readonly string[]): StrandsDictionary {
  const dictionaryWords = new Set<string>();

  for (const rawWord of words) {
    const word = rawWord.trim().toUpperCase();
    if (UPPERCASE_WORD_PATTERN.test(word)) {
      dictionaryWords.add(word);
    }
  }

  const prefixes = new Set<string>();
  for (const word of dictionaryWords) {
    for (let length = 1; length <= word.length; length += 1) {
      prefixes.add(word.slice(0, length));
    }
  }

  return { words: dictionaryWords, prefixes };
}
