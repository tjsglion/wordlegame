import type { StrandsDictionary } from "./dictionary";

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 15;
const LETTER_PATTERN = /^[A-Z]$/;

type GridCell = {
  readonly row: number;
  readonly column: number;
  readonly letter: string;
};

export function collectValidWords(
  grid: readonly (readonly string[] | string)[],
  dictionary: StrandsDictionary,
  excludedWords: readonly string[],
): string[] {
  const excluded = new Set(excludedWords.map((word) => word.trim().toUpperCase()));
  const cells = grid.map((row, rowIndex) =>
    Array.from(row, (letter, column) => ({
      row: rowIndex,
      column,
      letter: letter.toUpperCase(),
    })),
  );
  const validWords = new Set<string>();

  function visit(cell: GridCell, word: string, usedCells: ReadonlySet<string>) {
    if (!dictionary.prefixes.has(word)) {
      return;
    }

    if (word.length >= MIN_WORD_LENGTH && dictionary.words.has(word) && !excluded.has(word)) {
      validWords.add(word);
    }
    if (word.length === MAX_WORD_LENGTH) {
      return;
    }

    for (let row = cell.row - 1; row <= cell.row + 1; row += 1) {
      for (let column = cell.column - 1; column <= cell.column + 1; column += 1) {
        if (row === cell.row && column === cell.column) {
          continue;
        }
        const neighbor = cells[row]?.[column];
        const key = `${row},${column}`;
        if (!neighbor || !LETTER_PATTERN.test(neighbor.letter) || usedCells.has(key)) {
          continue;
        }

        const nextUsedCells = new Set(usedCells);
        nextUsedCells.add(key);
        visit(neighbor, word + neighbor.letter, nextUsedCells);
      }
    }
  }

  for (const row of cells) {
    for (const cell of row) {
      if (!LETTER_PATTERN.test(cell.letter)) {
        continue;
      }
      visit(cell, cell.letter, new Set([`${cell.row},${cell.column}`]));
    }
  }

  return [...validWords].sort();
}
