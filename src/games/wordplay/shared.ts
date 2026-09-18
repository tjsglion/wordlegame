export type { WordplayLevel } from "./levels";

export interface Point {
  r: number;
  c: number;
}

export function pointKey({ r, c }: Point) {
  return `${r},${c}`;
}

export function isAdjacent(a: Point, b: Point) {
  return Math.abs(a.r - b.r) <= 1 && Math.abs(a.c - b.c) <= 1 && pointKey(a) !== pointKey(b);
}

export function pathWord(rows: string[], path: Point[]) {
  return path.map(({ r, c }) => rows[r]?.[c] ?? "").join("");
}

/**
 * Smooth SVG trace through the cell centers of `points`. The overlay renders
 * in a normalized 100×100 viewBox, so a cell spans 100/size units and the
 * caller scales stroke-width accordingly.
 */
export function getSmoothPath(points: Point[], size: number) {
  if (points.length === 0 || size < 1) return "";
  const unit = 100 / size;
  const coords = points.map(({ r, c }) => ({ x: c * unit + unit / 2, y: r * unit + unit / 2 }));
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
