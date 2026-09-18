import { createStrandsDictionary, type StrandsDictionary } from "./dictionary";

export type CommonDictionaryRow = {
  readonly word: string;
  readonly length: number;
  readonly isCommonWord: boolean;
};

export function createDictionaryFromRows(
  rows: readonly CommonDictionaryRow[],
): StrandsDictionary {
  const dictionary = createStrandsDictionary(
    rows
      .filter((row) => row.isCommonWord && row.length >= 4)
      .map((row) => row.word),
  );

  if (dictionary.words.size === 0) {
    throw new Error("Common dictionary is empty");
  }

  return dictionary;
}
