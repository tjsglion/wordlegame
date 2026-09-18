import { isAdjacent, pointKey, touchesOppositeEdges, type Point, type StrandsPuzzle } from "./shared";

const solutionCache = new WeakMap<StrandsPuzzle, ReadonlyMap<string, readonly Point[]> | null>();
const MAX_SEARCH_NODES = 100_000;
const MAX_PATHS_PER_ANSWER = 1_000;

/** Finds the first legal path for a word in either direction. */
export function findPathForWord(target: string, grid: string[][], blocked: Set<string>) {
  return findPath(target, grid, blocked) ?? findPath(reverseWord(target), grid, blocked);
}

/**
 * Lazily derive and cache paths once per puzzle. Generated boards have
 * disjoint paths; malformed imported rows fail closed instead of reaching play.
 */
export function getStrandsSolutionPaths(puzzle: StrandsPuzzle): ReadonlyMap<string, readonly Point[]> | null {
  const cached = solutionCache.get(puzzle);
  if (cached !== undefined) return cached;
  const candidates = new Map<string, Point[][]>();
  for (const word of [puzzle.spangram, ...puzzle.words]) {
    const paths = findAllAnswerPaths(word, puzzle.grid, word === puzzle.spangram);
    if (paths.length === 0) { solutionCache.set(puzzle, null); return null; }
    candidates.set(word, paths);
  }
  const paths = new Map<string, readonly Point[]>();
  const remaining = [...candidates.keys()];
  const solve = (blocked: Set<string>): boolean => {
    if (remaining.length === 0) return blocked.size === puzzle.grid.length * (puzzle.grid[0]?.length ?? 0);
    remaining.sort((left, right) => (candidates.get(left) ?? []).filter((path) => path.every((point) => !blocked.has(pointKey(point)))).length - (candidates.get(right) ?? []).filter((path) => path.every((point) => !blocked.has(pointKey(point)))).length);
    const word = remaining.shift()!;
    for (const path of candidates.get(word) ?? []) {
      if (path.some((point) => blocked.has(pointKey(point)))) continue;
      path.forEach((point) => blocked.add(pointKey(point)));
      paths.set(word, path);
      if (solve(blocked)) return true;
      paths.delete(word);
      path.forEach((point) => blocked.delete(pointKey(point)));
    }
    remaining.unshift(word);
    return false;
  };
  const result = solve(new Set()) ? paths : null;
  solutionCache.set(puzzle, result);
  return result;
}

export function findPathForAnswer(target: string, grid: string[][], blocked: Set<string>, isSpangram: boolean) {
  return isSpangram
    ? findPath(target, grid, blocked, touchesOppositeEdges) ?? findPath(reverseWord(target), grid, blocked, touchesOppositeEdges)
    : findPathForWord(target, grid, blocked);
}

function findAllAnswerPaths(target: string, grid: string[][], isSpangram: boolean) {
  const result: Point[][] = [];
  const seen = new Set<string>();
  const budget = { remaining: MAX_SEARCH_NODES };
  for (const word of isSpangram ? [target, reverseWord(target)] : [target, reverseWord(target)]) {
    for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {
      if (budget.remaining <= 0 || result.length >= MAX_PATHS_PER_ANSWER) return [];
      collect(word, grid, [{ r, c }], result, seen, isSpangram ? touchesOppositeEdges : () => true, budget);
    }
  }
  return result;
}

function collect(target: string, grid: string[][], path: Point[], result: Point[][], seen: Set<string>, accept: (path: Point[]) => boolean, budget: { remaining: number }) {
  budget.remaining -= 1;
  if (budget.remaining < 0 || result.length >= MAX_PATHS_PER_ANSWER) return;
  const current = path[path.length - 1];
  if (grid[current.r]?.[current.c] !== target[path.length - 1]) return;
  if (path.length === target.length) {
    if (accept(path)) { const key = path.map(pointKey).join("|"); if (!seen.has(key)) { seen.add(key); result.push(path); } }
    return;
  }
  for (let r = current.r - 1; r <= current.r + 1; r++) for (let c = current.c - 1; c <= current.c + 1; c++) {
    const next = { r, c };
    if (isAdjacent(current, next) && !path.some((point) => pointKey(point) === pointKey(next))) collect(target, grid, [...path, next], result, seen, accept, budget);
  }
}

function findPath(target: string, grid: string[][], blocked: Set<string>, accept: (path: Point[]) => boolean = () => true) {
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {
    const path = search(target, grid, blocked, [{ r, c }], accept);
    if (path) return path;
  }
  return null;
}

function search(target: string, grid: string[][], blocked: Set<string>, path: Point[], accept: (path: Point[]) => boolean): Point[] | null {
  const current = path[path.length - 1];
  if (blocked.has(pointKey(current)) || grid[current.r]?.[current.c] !== target[path.length - 1]) return null;
  if (path.length === target.length) return accept(path) ? path : null;
  for (let r = current.r - 1; r <= current.r + 1; r++) for (let c = current.c - 1; c <= current.c + 1; c++) {
    const next = { r, c };
    if (!isAdjacent(current, next) || path.some((point) => pointKey(point) === pointKey(next))) continue;
    const found = search(target, grid, blocked, [...path, next], accept);
    if (found) return found;
  }
  return null;
}

function reverseWord(word: string) { return word.split("").reverse().join(""); }
