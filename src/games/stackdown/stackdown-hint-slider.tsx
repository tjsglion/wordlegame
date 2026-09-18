"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronsRight } from "lucide-react";

const HINT_HANDLE_SIZE_REM = 2.85;
const HINT_HANDLE_SIDE_GAP_REM = 0.35;
const HINT_HANDLE_TRAVEL_REM =
  HINT_HANDLE_SIZE_REM + HINT_HANDLE_SIDE_GAP_REM * 2;
const HINT_REVEAL_THRESHOLD = 0.6;
const HINT_RECOIL_MS = 280;

/** Accessible swipe/keyboard control that spends one hint for the active word. */
export const StackdownHintSlider = memo(function StackdownHintSlider({
  disabled,
  pending,
  clue,
  instruction,
  pendingLabel,
  onReveal,
}: {
  disabled: boolean;
  pending: boolean;
  clue: string | null;
  instruction: string;
  pendingLabel: string;
  onReveal: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRectRef = useRef<DOMRect | null>(null);
  const recoilTimeoutRef = useRef<number | null>(null);
  const [ratio, setRatio] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [keyboarding, setKeyboarding] = useState(false);
  const [awaitingReveal, setAwaitingReveal] = useState(false);
  const [recoiling, setRecoiling] = useState(false);

  const clearRecoil = useCallback(() => {
    if (recoilTimeoutRef.current !== null) {
      window.clearTimeout(recoilTimeoutRef.current);
      recoilTimeoutRef.current = null;
    }
    setRecoiling(false);
  }, []);

  const startRecoil = useCallback(() => {
    clearRecoil();
    setDragging(false);
    setKeyboarding(false);
    setRecoiling(true);
    setRatio(0);
    recoilTimeoutRef.current = window.setTimeout(() => {
      recoilTimeoutRef.current = null;
      setRecoiling(false);
    }, HINT_RECOIL_MS);
  }, [clearRecoil]);

  useEffect(
    () => () => {
      if (recoilTimeoutRef.current !== null) {
        window.clearTimeout(recoilTimeoutRef.current);
      }
    },
    [],
  );

  const revealed = clue !== null;

  useEffect(() => {
    if (!awaitingReveal || pending || revealed) return;
    const frame = window.requestAnimationFrame(() => {
      setAwaitingReveal(false);
      setKeyboarding(false);
      setRatio(0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [awaitingReveal, pending, revealed]);

  const updateFromPointer = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = dragRectRef.current ?? track.getBoundingClientRect();
    setRatio(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)));
  }, []);

  const inactive = disabled || pending || revealed;
  const interacting = dragging || keyboarding;
  const snappedToEnd = interacting && ratio >= HINT_REVEAL_THRESHOLD;
  const fillRatio =
    pending || revealed || awaitingReveal
      ? 1
      : interacting
        ? (snappedToEnd ? 1 : ratio)
        : 0;
  const handleRatio =
    pending
      ? 0.95
      : awaitingReveal
        ? 1
        : interacting
          ? (snappedToEnd ? 1 : ratio)
          : 0;
  const handleLeft = `calc(${HINT_HANDLE_SIDE_GAP_REM}rem + ${handleRatio} * (100% - ${HINT_HANDLE_TRAVEL_REM}rem))`;

  return (
    <div
      ref={trackRef}
      className={`sd-hint-slider ${dragging ? "dragging" : ""} ${
        disabled ? "disabled" : ""
      } ${pending ? "pending" : ""} ${recoiling ? "recoiling" : ""} ${
        snappedToEnd ? "snapped" : ""
      } ${revealed ? "revealed" : ""}`}
      role="slider"
      aria-label={pending ? pendingLabel : instruction}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fillRatio * 100)}
      aria-disabled={inactive}
      aria-busy={pending || undefined}
      tabIndex={inactive ? -1 : 0}
      onPointerDown={(event) => {
        if (inactive) return;
        clearRecoil();
        setKeyboarding(false);
        setAwaitingReveal(false);
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRectRef.current = event.currentTarget.getBoundingClientRect();
        setDragging(true);
        updateFromPointer(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging) updateFromPointer(event.clientX);
      }}
      onPointerUp={() => {
        if (!dragging) return;
        dragRectRef.current = null;
        setDragging(false);
        if (ratio >= HINT_REVEAL_THRESHOLD) {
          clearRecoil();
          setAwaitingReveal(true);
          setRatio(1);
          onReveal();
          return;
        }
        startRecoil();
      }}
      onPointerCancel={() => {
        dragRectRef.current = null;
        startRecoil();
      }}
      onBlur={() => {
        if (!keyboarding || ratio === 0 || pending || revealed || awaitingReveal) return;
        startRecoil();
      }}
      onKeyDown={(event) => {
        if (inactive) return;
        clearRecoil();
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setAwaitingReveal(true);
          setKeyboarding(false);
          setRatio(1);
          onReveal();
          return;
        }
        const step = 0.1;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = Math.min(1, ratio + step);
          if (next >= HINT_REVEAL_THRESHOLD) {
            setAwaitingReveal(true);
            setKeyboarding(false);
            setRatio(1);
            onReveal();
          } else {
            setAwaitingReveal(false);
            setKeyboarding(next > 0);
            setRatio(next);
          }
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          const next = Math.max(0, ratio - step);
          setAwaitingReveal(false);
          setKeyboarding(next > 0);
          setRatio(next);
        }
      }}
    >
      <div className="sd-hint-fill" style={{ width: `${fillRatio * 100}%` }} />
      <div className="sd-hint-label">
        {revealed ? (
          <span className="sd-hint-clue" aria-live="polite">{clue}</span>
        ) : pending ? (
          <span aria-live="polite">{pendingLabel}</span>
        ) : instruction}
      </div>
      <div className="sd-hint-handle" style={{ left: handleLeft }} aria-hidden>
        <ChevronsRight className="size-4" />
      </div>
    </div>
  );
});
