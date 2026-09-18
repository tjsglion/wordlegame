"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  getSmoothPath,
  pointKey,
  type Point,
  type WordplayLevel,
} from "./shared";

interface WordplayBoardProps {
  level: WordplayLevel;
  path: Point[];
  errorPath: Point[];
  hintCell: Point | null;
  locked: boolean;
  onPointerDown: (point: Point) => void;
  onPointerMove: (point: Point, buttons: number) => void;
  onPointerUp: () => void;
}

function cellPoint(element: Element | null): Point | null {
  const cell = element?.closest<HTMLElement>("[data-wordplay-cell]");
  const value = cell?.dataset.wordplayCell;
  if (!value) return null;
  const [r, c] = value.split(",").map(Number);
  return Number.isInteger(r) && Number.isInteger(c) ? { r, c } : null;
}

function cellLabel(
  t: (key: string, values?: Record<string, string | number>) => string,
  letter: string,
  point: Point,
  active: boolean,
  hint: boolean,
  error: boolean,
) {
  const states = [
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

export function WordplayBoard({
  level,
  path,
  errorPath,
  hintCell,
  locked,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: WordplayBoardProps) {
  const t = useTranslations("Wordplay");
  const { size, rows } = level;
  const activeCells = new Set(path.map(pointKey));
  const errorCells = new Set(errorPath.map(pointKey));
  const hintKey = hintCell ? pointKey(hintCell) : null;
  const strokeWidth = 20 / size;

  const moveFromPosition = useCallback(
    (clientX: number, clientY: number, buttons: number) => {
      const point = cellPoint(document.elementFromPoint(clientX, clientY));
      if (point) onPointerMove(point, buttons);
    },
    [onPointerMove],
  );
  const selectCell = useCallback(
    (point: Point) => {
      onPointerDown(point);
      onPointerUp();
    },
    [onPointerDown, onPointerUp],
  );

  useEffect(() => {
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [onPointerUp]);

  return (
    <div className="wordplay-board" role="group" aria-label={t("gridAria")}>
      <svg className="wordplay-paths" viewBox="0 0 100 100" aria-hidden>
        {path.length > 0 ? (
          <path
            d={getSmoothPath(path, size)}
            className="wordplay-path wordplay-path--active"
            style={{ strokeWidth }}
          />
        ) : null}
        {errorPath.length > 0 ? (
          <path
            d={getSmoothPath(errorPath, size)}
            className="wordplay-path wordplay-path--error"
            style={{ strokeWidth }}
          />
        ) : null}
      </svg>

      <div
        className="wordplay-cells"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {rows.map((row, r) =>
          row.split("").map((letter, c) => {
            const point = { r, c };
            const key = pointKey(point);
            const active = activeCells.has(key);
            const error = errorCells.has(key);
            const hint = hintKey === key;
            const classes = [
              "wordplay-cell",
              active ? "is-active" : "",
              error ? "is-error" : "",
              hint ? "is-hint" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={key}
                type="button"
                className={classes}
                data-wordplay-cell={key}
                aria-label={cellLabel(t, letter, point, active, hint, error)}
                disabled={locked}
                onPointerDown={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  onPointerDown(point);
                }}
                onPointerMove={(event) =>
                  moveFromPosition(event.clientX, event.clientY, event.buttons)
                }
                onClick={(event) => {
                  if (event.detail === 0) selectCell(point);
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
