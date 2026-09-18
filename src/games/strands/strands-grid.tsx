"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSmoothPath, pointKey, type FoundWord, type Point } from "./shared";

interface StrandsGridProps {
  grid: string[][];
  foundWords: FoundWord[];
  path: Point[];
  errorPath: Point[];
  hintCells: Point[];
  locked: boolean;
  onPointerDown: (point: Point) => void;
  onPointerMove: (point: Point, buttons: number) => void;
  onPointerUp: () => void;
  onActivate: (point: Point) => void;
}

function cellPoint(element: Element | null): Point | null {
  const cell = element?.closest<HTMLElement>("[data-strands-cell]");
  const value = cell?.dataset.strandsCell;
  if (!value) return null;
  const [r, c] = value.split(",").map(Number);
  return Number.isInteger(r) && Number.isInteger(c) ? { r, c } : null;
}

function cellLabel(
  t: (key: string, values?: Record<string, string | number>) => string,
  letter: string,
  point: Point,
  found: FoundWord | undefined,
  active: boolean,
  hint: boolean,
  error: boolean,
) {
  const states = [
    found
      ? found.isSpangram
        ? t("cellStateFoundSpangram")
        : t("cellStateFound")
      : null,
    active ? t("cellStateSelected") : null,
    hint ? t("cellStateHint") : null,
    error ? t("cellStateError") : null,
  ].filter(Boolean);
  const stateText = states.join(t("cellStateDivider"));
  return t("cellAria", {
    letter,
    row: point.r + 1,
    column: point.c + 1,
    states: stateText ? `${t("cellStatePrefix")}${stateText}` : "",
  }).trim();
}

export function StrandsGrid({
  grid,
  foundWords,
  path,
  errorPath,
  hintCells,
  locked,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onActivate,
}: StrandsGridProps) {
  const t = useTranslations("Strands");
  const foundCells = new Map<string, FoundWord>();
  for (const found of foundWords) {
    for (const point of found.path) {
      foundCells.set(pointKey(point), found);
    }
  }
  const activeCells = new Set(path.map(pointKey));
  const errorCells = new Set(errorPath.map(pointKey));
  const hintCellKeys = new Set(hintCells.map(pointKey));
  const [focusPoint, setFocusPoint] = useState<Point>({ r: 0, c: 0 });
  const moveFromPosition = useCallback(
    (clientX: number, clientY: number, buttons: number) => {
      const point = cellPoint(document.elementFromPoint(clientX, clientY));
      if (point) onPointerMove(point, buttons);
    },
    [onPointerMove],
  );
  const moveFocus = useCallback((point: Point, rowDelta: number, columnDelta: number) => {
    let next = point;
    const rowLimit = grid.length - 1;
    const columnLimit = (grid[0]?.length ?? 1) - 1;
    while (true) {
      const candidate = { r: Math.max(0, Math.min(rowLimit, next.r + rowDelta)), c: Math.max(0, Math.min(columnLimit, next.c + columnDelta)) };
      if (pointKey(candidate) === pointKey(next)) break;
      next = candidate;
      if (!locked && !foundCells.has(pointKey(next))) break;
    }
    if (locked || foundCells.has(pointKey(next))) return;
    setFocusPoint(next);
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-strands-cell="${pointKey(next)}"]`)?.focus());
  }, [foundCells, grid, locked]);

  useEffect(() => {
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [onPointerUp]);

  return (
    <div className="strands-grid" role="group" aria-label={t("gridAria")}>
      <p id="strands-grid-instructions" className="sr-only">{t("gridInstructions")}</p>
      <svg className="strands-paths" viewBox="0 0 600 800" aria-hidden>
        {foundWords.map((found) => (
          <path
            key={`${found.word}-${found.path.map(pointKey).join("-")}`}
            d={getSmoothPath(found.path)}
            className={
              found.isSpangram
                ? "strands-path strands-path--spangram"
                : "strands-path strands-path--found"
            }
            pathLength="1"
          />
        ))}
        {path.length > 0 ? (
          <path
            d={getSmoothPath(path)}
            className="strands-path strands-path--active"
          />
        ) : null}
        {errorPath.length > 0 ? (
          <path
            d={getSmoothPath(errorPath)}
            className="strands-path strands-path--error"
          />
        ) : null}
      </svg>

      <div className="strands-cells">
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const point = { r, c };
            const key = pointKey(point);
            const found = foundCells.get(key);
            const classes = [
              "strands-cell",
              found ? (found.isSpangram ? "is-spangram" : "is-found") : "",
              activeCells.has(key) ? "is-active" : "",
              errorCells.has(key) ? "is-error" : "",
              hintCellKeys.has(key) ? "is-hint" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={key}
                type="button"
                className={classes}
                data-strands-cell={key}
                tabIndex={pointKey(focusPoint) === key ? 0 : -1}
                aria-describedby="strands-grid-instructions"
                aria-label={cellLabel(
                  t,
                  letter,
                  point,
                  found,
                  activeCells.has(key),
                  hintCellKeys.has(key),
                  errorCells.has(key),
                )}
                disabled={locked || Boolean(found)}
                onPointerDown={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  onPointerDown(point);
                }}
                onPointerMove={(event) =>
                  moveFromPosition(event.clientX, event.clientY, event.buttons)
                }
                onFocus={() => setFocusPoint(point)}
                onKeyDown={(event) => {
                  const deltas: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
                  const delta = deltas[event.key];
                  if (!delta) return;
                  event.preventDefault();
                  moveFocus(point, delta[0], delta[1]);
                }}
                onClick={(event) => {
                  if (event.detail === 0) onActivate(point);
                }}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
