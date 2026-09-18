import {
  STRANDS_COLUMNS,
  STRANDS_ROWS,
  STRANDS_CELL_COUNT,
  type Point,
  isAdjacent,
  pointKey,
  touchesOppositeEdges,
} from "./shared";

export interface StrandsGridWord {
  readonly text: string;
  readonly isSpangram: boolean;
}

export interface StrandsGridSolution {
  readonly grid: string[][];
  readonly paths: ReadonlyMap<string, readonly Point[]>;
}

export interface GridGenerationOptions {
  readonly random?: () => number;
  readonly maxOperations?: number;
}

const DEFAULT_MAX_OPERATIONS = 200_000;

/**
 * Creates one non-overlapping, 8-directional layout for words that exactly
 * cover the 6×8 board. This is deliberately independent of the LLM layer.
 */
export function generateStrandsGrid(
  input: readonly StrandsGridWord[],
  options: GridGenerationOptions = {},
): StrandsGridSolution | null {
  if (input.length === 0 || input.reduce((total, word) => total + word.text.length, 0) !== STRANDS_CELL_COUNT) {
    return null;
  }
  if (input.some(({ text }) => !/^[A-Z]+$/.test(text))) return null;

  const spangrams = input.filter(({ isSpangram }) => isSpangram);
  if (spangrams.length !== 1) return null;

  const words = [...input].sort((left, right) =>
    Number(right.isSpangram) - Number(left.isSpangram) || right.text.length - left.text.length,
  );
  const random = options.random ?? Math.random;
  const maxOperations = options.maxOperations ?? DEFAULT_MAX_OPERATIONS;
  const grid: (string | null)[][] = Array.from(
    { length: STRANDS_ROWS },
    () => Array.from({ length: STRANDS_COLUMNS }, () => null),
  );
  const paths = new Map<string, Point[]>();
  const usedEdges = new Set<string>();
  let operations = 0;

  function reachedLimit() {
    operations += 1;
    return operations > maxOperations;
  }

  function edgeKey(first: Point, second: Point) {
    const left = pointKey(first);
    const right = pointKey(second);
    return left < right ? `${left}:${right}` : `${right}:${left}`;
  }

  function crossesExistingDiagonal(first: Point, second: Point) {
    if (Math.abs(first.r - second.r) !== 1 || Math.abs(first.c - second.c) !== 1) return false;
    return usedEdges.has(edgeKey({ r: first.r, c: second.c }, { r: second.r, c: first.c }));
  }

  function emptyNeighbors(point: Point) {
    let count = 0;
    for (let r = point.r - 1; r <= point.r + 1; r += 1) {
      for (let c = point.c - 1; c <= point.c + 1; c += 1) {
        if ((r !== point.r || c !== point.c) && grid[r]?.[c] === null) count += 1;
      }
    }
    return count;
  }

  function shuffle<T>(items: readonly T[]) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function hasHealthyEmptyRegions(remaining: readonly StrandsGridWord[]) {
    if (remaining.length === 0) return true;
    const smallestWord = Math.min(...remaining.map(({ text }) => text.length));
    const seen = new Set<string>();
    for (let r = 0; r < STRANDS_ROWS; r += 1) {
      for (let c = 0; c < STRANDS_COLUMNS; c += 1) {
        const start = { r, c };
        const startKey = pointKey(start);
        if (grid[r][c] !== null || seen.has(startKey)) continue;
        let size = 0;
        const queue = [start];
        seen.add(startKey);
        while (queue.length > 0) {
          const current = queue.pop()!;
          size += 1;
          for (let nextRow = current.r - 1; nextRow <= current.r + 1; nextRow += 1) {
            for (let nextColumn = current.c - 1; nextColumn <= current.c + 1; nextColumn += 1) {
              const next = { r: nextRow, c: nextColumn };
              const nextKey = pointKey(next);
              if (!isAdjacent(current, next) || grid[next.r]?.[next.c] !== null || seen.has(nextKey)) continue;
              seen.add(nextKey);
              queue.push(next);
            }
          }
        }
        if (size < smallestWord) return false;
      }
    }
    return true;
  }

  function placeWord(wordIndex: number) {
    if (reachedLimit()) return false;
    if (wordIndex === words.length) return true;
    if (!hasHealthyEmptyRegions(words.slice(wordIndex))) return false;
    const starts = shuffle(
      Array.from({ length: STRANDS_CELL_COUNT }, (_, index) => ({
        r: Math.floor(index / STRANDS_COLUMNS),
        c: index % STRANDS_COLUMNS,
      })).filter(({ r, c }) => grid[r][c] === null),
    );
    return starts.some((start) => placeLetter(wordIndex, 0, start, []));
  }

  function placeLetter(wordIndex: number, letterIndex: number, point: Point, path: Point[]): boolean {
    if (reachedLimit() || grid[point.r]?.[point.c] !== null) return false;
    const word = words[wordIndex];
    const previous = path[path.length - 1];
    if (previous && crossesExistingDiagonal(previous, point)) return false;

    grid[point.r][point.c] = word.text[letterIndex];
    if (previous) usedEdges.add(edgeKey(previous, point));
    const nextPath = [...path, point];
    let solved = false;

    if (letterIndex + 1 === word.text.length) {
      if (!word.isSpangram || touchesOppositeEdges(nextPath)) {
        paths.set(word.text, nextPath);
        solved = placeWord(wordIndex + 1);
        if (!solved) paths.delete(word.text);
      }
    } else {
      const nextPoints = shuffle(
        Array.from({ length: 9 }, (_, index) => ({
          r: point.r - 1 + Math.floor(index / 3),
          c: point.c - 1 + (index % 3),
        })).filter((next) => isAdjacent(point, next) && grid[next.r]?.[next.c] === null),
      ).sort((left, right) => emptyNeighbors(left) - emptyNeighbors(right));
      solved = nextPoints.some((next) => placeLetter(wordIndex, letterIndex + 1, next, nextPath));
    }

    if (solved) return true;
    grid[point.r][point.c] = null;
    if (previous) usedEdges.delete(edgeKey(previous, point));
    return false;
  }

  if (!placeWord(0)) return null;
  return {
    grid: grid.map((row) => row.map((letter) => letter ?? "")),
    paths,
  };
}
