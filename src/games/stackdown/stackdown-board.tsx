"use client";

import { memo, useMemo, type CSSProperties, type MutableRefObject, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { exposedTileIds, WORD_LENGTH } from "./shared";
import type { BoardTile, SlotTile } from "./use-stackdown";

export const TILE_SIZE_PCT = 100 / 6.25;
export const TILE_HEIGHT_PCT = 17.6;
export const GRID_MARGIN_PCT = 3.75;
export const GRID_STEP_PCT = (TILE_SIZE_PCT + 100 / 32) / 2;

function tilePosition(tile: BoardTile): { left: string; top: string } {
  return {
    left: `${GRID_MARGIN_PCT + GRID_STEP_PCT * tile.x}%`,
    top: `${GRID_MARGIN_PCT + GRID_STEP_PCT * tile.y}%`,
  };
}

export const StackdownSlots = memo(function StackdownSlots({
  slots,
  shake,
  returning,
  returnFromIndex,
  returnDelays,
  pending,
  solving,
  pickPending,
  slotRefs,
  onUnpick,
}: {
  slots: Array<SlotTile | undefined>;
  shake: boolean;
  returning: boolean;
  returnFromIndex: number | null;
  returnDelays: ReadonlyMap<number, number>;
  pending: boolean;
  solving: boolean;
  pickPending: boolean;
  slotRefs: MutableRefObject<Array<HTMLElement | null>>;
  onUnpick: (slotIndex: number) => void;
}) {
  const t = useTranslations("Stackdown");

  return (
    <div
      className={`sd-slots ${shake ? "sd-incorrect" : ""} ${
        returning ? "sd-returning" : ""
      } ${pending ? "sd-pending" : ""} ${solving ? "sd-solved" : ""}`}
      aria-live="polite"
      aria-busy={pending || undefined}
    >
      {Array.from({ length: WORD_LENGTH }).map((_, index) => {
        const slot = slots[index];
        const isReturning =
          slot !== undefined && returnFromIndex !== null && index >= returnFromIndex;
        const returnDelay = isReturning ? returnDelays.get(index) ?? 0 : 0;
        return slot ? (
          <button
            key={index}
            type="button"
            className="sd-slot filled game-pop"
            disabled={pending || solving || returning || pickPending || isReturning}
            onClick={() => onUnpick(index)}
            ref={(element) => {
              slotRefs.current[index] = element;
            }}
            aria-label={t("a11y.removeLetter", { letter: slot.letter.toUpperCase() })}
          >
            <span
              className={`sd-slot-letter ${isReturning ? "sd-slot-letter--returning" : ""}`}
              style={
                isReturning
                  ? ({ "--sd-return-delay": `${returnDelay}ms` } as CSSProperties)
                  : pending || solving
                    ? { animationDelay: `${index * 60}ms` }
                    : undefined
              }
            >
              {slot.letter}
            </span>
          </button>
        ) : (
          <div
            key={index}
            className="sd-slot"
            ref={(element) => {
              slotRefs.current[index] = element;
            }}
            aria-hidden
          />
        );
      })}
    </div>
  );
});

export const StackdownBoard = memo(function StackdownBoard({
  tiles,
  presentIds,
  finished,
  slotsLength,
  flyingPickIds,
  pickPending,
  boardRef,
  onPick,
}: {
  tiles: BoardTile[];
  presentIds: number[];
  finished: boolean;
  slotsLength: number;
  flyingPickIds: ReadonlySet<number>;
  pickPending: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  onPick: (tileId: number, element: HTMLButtonElement) => void;
}) {
  const t = useTranslations("Stackdown");
  const presentSet = useMemo(() => new Set(presentIds), [presentIds]);
  const visualExposed = useMemo(
    () => exposedTileIds(tiles, presentIds),
    [tiles, presentIds],
  );

  return (
    <div ref={boardRef} className="sd-board" role="group" aria-label={t("a11y.board")}>
      {tiles.filter((tile) => presentSet.has(tile.id)).map((tile) => {
        const isExposed = visualExposed.has(tile.id);
        const style = { ...tilePosition(tile), zIndex: tile.z + 1 };
        return isExposed ? (
          <button
            key={tile.id}
            type="button"
            className={`sd-tile exposed ${flyingPickIds.has(tile.id) ? "sd-tile--in-flight" : ""}`}
            style={style}
            disabled={finished || slotsLength >= WORD_LENGTH || pickPending}
            onClick={(event) => onPick(tile.id, event.currentTarget)}
            aria-label={t("a11y.pickLetter", { letter: tile.letter.toUpperCase() })}
          >
            <span className="sd-tile-surface">{tile.letter}</span>
          </button>
        ) : (
          <div key={tile.id} className="sd-tile covered" style={style} aria-hidden>
            <span className="sd-tile-surface">{tile.letter}</span>
          </div>
        );
      })}
    </div>
  );
});
