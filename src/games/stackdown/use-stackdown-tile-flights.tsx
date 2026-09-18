"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject, type RefObject } from "react";
import {
  GRID_MARGIN_PCT,
  GRID_STEP_PCT,
  TILE_HEIGHT_PCT,
  TILE_SIZE_PCT,
} from "./stackdown-board";
import type { BoardTile, SlotTile } from "./use-stackdown";

const WRONG_SHAKE_MS = 750;
const WRONG_RETURN_STAGGER_MS = 58;

interface FlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TileFlight {
  key: string;
  tileId: number;
  letter: string;
  from: FlightRect;
  to: FlightRect;
  direction: "pick" | "return";
  delayMs?: number;
  zIndex: number;
  onLanding?: () => void;
}

function snapshotRect(rect: DOMRect): FlightRect {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StackdownTileFlights({
  flights,
  onFlightEnd,
}: {
  flights: TileFlight[];
  onFlightEnd: (key: string) => void;
}) {
  return (
    <div className="sd-tile-flights" aria-hidden>
      {flights.map((flight) => {
        const style = {
          left: `${flight.from.left}px`,
          top: `${flight.from.top}px`,
          width: `${flight.from.width}px`,
          height: `${flight.from.height}px`,
          "--sd-flight-x": `${flight.to.left - flight.from.left}px`,
          "--sd-flight-y": `${flight.to.top - flight.from.top}px`,
          "--sd-flight-scale": String(flight.to.width / flight.from.width),
          animationDelay: flight.delayMs ? `${flight.delayMs}ms` : undefined,
          zIndex: flight.zIndex,
        } as CSSProperties;
        return (
          <span
            key={flight.key}
            className={`sd-tile-flight sd-tile-flight--${flight.direction}`}
            style={style}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) onFlightEnd(flight.key);
            }}
          >
            <span className="sd-tile-surface">{flight.letter}</span>
          </span>
        );
      })}
    </div>
  );
}

/** Owns only the ephemeral measured animation layer; `useStackdown` remains authoritative. */
export function useStackdownTileFlights({
  tiles,
  slots,
  returning,
  returnFromIndex,
  shake,
  completeReturn,
}: {
  tiles: BoardTile[];
  slots: SlotTile[];
  returning: boolean;
  returnFromIndex: number | null;
  shake: boolean;
  completeReturn: () => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Array<HTMLElement | null>>([]);
  const [flights, setFlights] = useState<TileFlight[]>([]);
  const landingsRef = useRef(new Map<string, () => void>());
  const wrongReturnStartedRef = useRef(false);

  useEffect(
    () => () => {
      landingsRef.current.clear();
    },
    [],
  );

  const queueFlights = useCallback((nextFlights: TileFlight[]) => {
    if (nextFlights.length === 0) return;
    if (prefersReducedMotion()) {
      nextFlights.forEach((flight) => flight.onLanding?.());
      return;
    }
    nextFlights.forEach((flight) => {
      if (flight.onLanding) landingsRef.current.set(flight.key, flight.onLanding);
    });
    setFlights((current) => [...current, ...nextFlights]);
  }, []);

  const completeFlight = useCallback((key: string) => {
    setFlights((current) => current.filter((flight) => flight.key !== key));
    const onLanding = landingsRef.current.get(key);
    landingsRef.current.delete(key);
    onLanding?.();
  }, []);

  const boardTileRect = useCallback((tile: BoardTile): FlightRect | null => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    return {
      left: rect.left + (rect.width * (GRID_MARGIN_PCT + GRID_STEP_PCT * tile.x)) / 100,
      top: rect.top + (rect.height * (GRID_MARGIN_PCT + GRID_STEP_PCT * tile.y)) / 100,
      width: (rect.width * TILE_SIZE_PCT) / 100,
      height: (rect.height * TILE_HEIGHT_PCT) / 100,
    };
  }, []);

  const pick = useCallback((tileId: number, element: HTMLButtonElement, onPick: (id: number) => void) => {
    const target = slotRefs.current[slots.length];
    const tile = tiles[tileId];
    if (!target || !tile) {
      onPick(tileId);
      return;
    }
    queueFlights([{
      key: `pick-${tileId}-${Date.now()}`,
      tileId,
      letter: tile.letter,
      from: snapshotRect(element.getBoundingClientRect()),
      to: snapshotRect(target.getBoundingClientRect()),
      direction: "pick",
      zIndex: tile.z + 1,
      // The tile is not logically picked until its visible flight has landed.
      // This keeps the board stack, clone, and answer slot in one lifecycle.
      onLanding: () => onPick(tileId),
    }]);
  }, [queueFlights, slots.length, tiles]);

  const flyingTileIds = useMemo(
    () => new Set(flights.filter((flight) => flight.direction === "pick").map((flight) => flight.tileId)),
    [flights],
  );
  const isPickPending = flyingTileIds.size > 0;

  const returnDelays = useMemo(() => {
    const delays = new Map<number, number>();
    if (!returning || returnFromIndex === null) return delays;
    const baseDelay = shake ? WRONG_SHAKE_MS : 0;
    for (let index = returnFromIndex; index < slots.length; index += 1) {
      delays.set(index, baseDelay + (slots.length - 1 - index) * WRONG_RETURN_STAGGER_MS);
    }
    return delays;
  }, [returnFromIndex, returning, shake, slots.length]);

  useEffect(() => {
    if (!returning || returnFromIndex === null) {
      wrongReturnStartedRef.current = false;
      return;
    }
    if (wrongReturnStartedRef.current) return;
    wrongReturnStartedRef.current = true;
    if (prefersReducedMotion()) {
      completeReturn();
      return;
    }
    const baseDelay = shake ? WRONG_SHAKE_MS : 0;
    const returningSlots = slots.slice(returnFromIndex);
    const returnFlights = returningSlots.flatMap((slot, offset) => {
      const index = returnFromIndex + offset;
      const source = slotRefs.current[index];
      const tile = tiles[slot.tileId];
      const target = tile ? boardTileRect(tile) : null;
      if (!source || !tile || !target) return [];
      return [{
        key: `return-${slot.tileId}-${Date.now()}`,
        tileId: slot.tileId,
        letter: tile.letter,
        from: snapshotRect(source.getBoundingClientRect()),
        to: target,
        direction: "return" as const,
        delayMs: returnDelays.get(index) ?? baseDelay,
        zIndex: tile.z + 1,
        // This is the last tile to leave the slots, so it authoritatively
        // completes the return rather than relying on a nominal timeout.
        onLanding: index === returnFromIndex ? completeReturn : undefined,
      }];
    }).reverse();
    if (returnFlights.length === 0) {
      completeReturn();
      return;
    }
    queueFlights(returnFlights);
  }, [boardTileRect, completeReturn, queueFlights, returnDelays, returnFromIndex, returning, shake, slots, tiles]);

  return {
    boardRef: boardRef as RefObject<HTMLDivElement | null>,
    slotRefs: slotRefs as MutableRefObject<Array<HTMLElement | null>>,
    flights,
    flyingTileIds,
    isPickPending,
    returnDelays,
    pick,
    completeFlight,
  };
}
