"use client";

import {
  FLIP_DURATION,
  FLIP_STAGGER,
  LETTER_STATE_CLASS,
  MAX_GUESSES,
  WORD_LENGTH,
  type GameStatus,
  type LetterState,
} from "./shared";

interface BoardProps {
  guesses: string[];
  /** Server-returned letter states, aligned with `guesses`. */
  results: LetterState[][];
  current: string;
  status: GameStatus;
  /** True briefly after an invalid submission (shake the current row). */
  shake: boolean;
  /** True while the guess request is in flight (pulse the current row). */
  submitting: boolean;
  /** True while the just-submitted row's staggered flip is playing — used to
   * promote only that row's tiles to compositor layers via `will-change`,
   * then release them once the reveal ends. */
  revealing: boolean;
  /** True only for a win that just happened this session (not a restored
   * one) — gates the winning row's bounce celebration. */
  celebrate: boolean;
  /** True while restored re-evaluated results are applied post-mount —
   * suppresses the flip transition so a refresh doesn't replay it. */
  skipFlipAnim: boolean;
}

/**
 * The single state a board row can be in:
 * - `idle`: empty future row, or a revealed non-winning row.
 * - `current`: the input row accepting letters.
 * - `shaking`: input row right after an invalid submission.
 * - `pending`: input row while the guess request is in flight.
 * - `won`: the revealed winning row (bounce celebration).
 */
type RowState = "idle" | "current" | "shaking" | "pending" | "won";

function Tile({
  letter,
  state,
  delay,
  filled,
  bounce,
  willChange,
  pop,
}: {
  letter: string;
  state: LetterState | null;
  delay: number;
  filled: boolean;
  /** Win celebration: bounce this tile right after its flip completes. */
  bounce: boolean;
  /** Pre-promote to a compositor layer for an imminent flip (revealing row
   * only) — avoids first-flip jank without keeping 30 layers alive. */
  willChange: boolean;
  /** Typing feedback pop — input row only, so restored/submitted tiles don't
   * all pop at mount. */
  pop: boolean;
}) {
  return (
    <div
      className={`wordle-tile ${bounce ? "wordle-bounce" : ""}`}
      style={bounce ? { animationDelay: `${delay + FLIP_DURATION}ms` } : undefined}
    >
      <div
        className={`wordle-tile-inner ${state ? "flipped" : ""}`}
        style={{
          // Flip duration comes from FLIP_DURATION (single source of truth);
          // globals.css only declares the property and timing function.
          transitionDuration: `${FLIP_DURATION}ms`,
          transitionDelay: `${delay}ms`,
          willChange: willChange ? "transform" : undefined,
        }}
      >
        {/* key={letter} remounts only the front face per keystroke so the pop
            animation replays — the flip container above must stay mounted
            across the input→submitted transition or the flip never animates. */}
        <div
          key={letter}
          className={`wordle-face wordle-front ${
            filled ? "filled" : ""
          } ${pop && filled ? "wordle-pop" : ""}`}
        >
          {letter}
        </div>
        <div
          className={`wordle-face wordle-back ${
            state ? LETTER_STATE_CLASS[state] : ""
          }`}
        >
          {letter}
        </div>
      </div>
    </div>
  );
}

function Row({
  word,
  states,
  rowState,
  revealing,
}: {
  word: string;
  states: LetterState[] | null;
  rowState: RowState;
  /** True only on the row whose staggered flip is currently playing. */
  revealing: boolean;
}) {
  // The input row (in any of its phases) tracks live typing.
  const isInput =
    rowState === "current" || rowState === "shaking" || rowState === "pending";
  return (
    <div
      className={`grid grid-cols-5 gap-2.5 ${
        rowState === "shaking" ? "wordle-shake" : ""
      } ${rowState === "pending" ? "wordle-pending" : ""}`}
      data-current={isInput || undefined}
    >
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = word[i] ?? "";
        return (
          // Stable key: the tile must NOT remount when the input row becomes
          // a submitted row, or the flip class would apply at mount and the
          // transition would never run.
          <Tile
            key={i}
            letter={letter}
            state={states ? states[i] : null}
            delay={states ? i * FLIP_STAGGER : 0}
            filled={Boolean(letter)}
            bounce={rowState === "won"}
            willChange={revealing}
            pop={rowState === "current"}
          />
        );
      })}
    </div>
  );
}

export function Board({
  guesses,
  results,
  current,
  status,
  shake,
  submitting,
  revealing,
  celebrate,
  skipFlipAnim,
}: BoardProps) {
  // The winning row is the final submitted guess; its tiles bounce once the
  // flip reveal has played — but only for a fresh win, not a restored one.
  const winRow = status === "won" && celebrate ? guesses.length - 1 : -1;
  // The row whose flip is playing right now gets will-change promotion.
  const revealRow = revealing ? guesses.length - 1 : -1;

  const rows = Array.from({ length: MAX_GUESSES }, (_, row) => {
    if (row < guesses.length) {
      return (
        <Row
          key={row}
          word={guesses[row]}
          states={results[row] ?? null}
          rowState={row === winRow ? "won" : "idle"}
          revealing={row === revealRow}
        />
      );
    }
    if (row === guesses.length && status === "playing") {
      return (
        <Row
          key={row}
          word={current}
          states={null}
          rowState={shake ? "shaking" : submitting ? "pending" : "current"}
          revealing={false}
        />
      );
    }
    return (
      <Row key={row} word="" states={null} rowState="idle" revealing={false} />
    );
  });

  return (
    <div
      className={`wordle-board mx-auto grid w-full gap-2.5 ${
        skipFlipAnim ? "wordle-no-anim" : ""
      }`}
      role="grid"
    >
      {rows}
    </div>
  );
}
