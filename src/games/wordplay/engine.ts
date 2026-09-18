import {
  isAdjacent,
  pathWord,
  pointKey,
  type Point,
  type WordplayLevel,
} from "./shared";

export const MIN_WORD_LENGTH = 3;

/** In-bounds, self-avoiding, 8-directionally connected. Cells stay reusable
 * across traces, so unlike Strands there is no occupied-cell rule. */
export function validatePath(path: Point[], size: number) {
  const visited = new Set<string>();
  return (
    path.length > 0 &&
    path.every((point, index) => {
      const key = pointKey(point);
      const valid =
        point.r >= 0 &&
        point.r < size &&
        point.c >= 0 &&
        point.c < size &&
        !visited.has(key) &&
        (index === 0 || isAdjacent(path[index - 1], point));
      visited.add(key);
      return valid;
    })
  );
}

export type WordplaySubmitResult =
  | { kind: "target"; word: string; isLevelComplete: boolean }
  | { kind: "bonus"; word: string }
  | { kind: "already-found" | "too-short" | "unknown"; errorPath: Point[] };

export function submitPath(
  level: WordplayLevel,
  path: Point[],
  foundTargets: ReadonlySet<string>,
  foundBonus: ReadonlySet<string>,
): WordplaySubmitResult {
  if (!validatePath(path, level.size)) return { kind: "unknown", errorPath: path };
  const word = pathWord(level.rows, path);
  const reverse = word.split("").reverse().join("");
  const target = level.targets.includes(word)
    ? word
    : level.targets.includes(reverse)
      ? reverse
      : null;
  const bonus = level.bonus.includes(word)
    ? word
    : level.bonus.includes(reverse)
      ? reverse
      : null;
  const canonical = target ?? bonus;
  if (canonical && (foundTargets.has(canonical) || foundBonus.has(canonical))) {
    return { kind: "already-found", errorPath: path };
  }
  if (target) {
    return {
      kind: "target",
      word: target,
      isLevelComplete: foundTargets.size + 1 === level.targets.length,
    };
  }
  if (bonus) return { kind: "bonus", word: bonus };
  return { kind: word.length < MIN_WORD_LENGTH ? "too-short" : "unknown", errorPath: path };
}

/** Starting cell of a random un-found target word, for the hint button. */
export function pickHintTarget(
  level: WordplayLevel,
  foundTargets: ReadonlySet<string>,
  random: () => number = Math.random,
): { word: string; start: Point } | null {
  const remaining = level.targets.filter((word) => !foundTargets.has(word));
  if (remaining.length === 0) return null;
  const word = remaining[Math.floor(random() * remaining.length)];
  const path =
    findWordPath(level.rows, word) ??
    findWordPath(level.rows, word.split("").reverse().join(""));
  return path ? { word, start: path[0] } : null;
}

/** 8-directional self-avoiding DFS for a word's path on the grid. */
function findWordPath(rows: string[], word: string): Point[] | null {
  const size = rows.length;

  function search(path: Point[]): Point[] | null {
    const current = path[path.length - 1];
    if (rows[current.r]?.[current.c] !== word[path.length - 1]) return null;
    if (path.length === word.length) return path;
    for (let r = current.r - 1; r <= current.r + 1; r++) {
      for (let c = current.c - 1; c <= current.c + 1; c++) {
        const next = { r, c };
        if (!isAdjacent(current, next)) continue;
        if (path.some((point) => pointKey(point) === pointKey(next))) continue;
        const found = search([...path, next]);
        if (found) return found;
      }
    }
    return null;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const found = search([{ r, c }]);
      if (found) return found;
    }
  }
  return null;
}
