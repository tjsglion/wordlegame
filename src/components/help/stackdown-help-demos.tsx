"use client";

import { useEffect, useState } from "react";
import { ChevronsRight, Sparkles } from "lucide-react";
import {
  STACK_TEMPLATE,
  WORD_LENGTH,
  overlaps,
} from "@/games/stackdown/shared";

/**
 * Looping gameplay demos for the Stackdown how-to-play modal — the code-drawn
 * counterpart of puzzlist's recorded mp4 clips. Each demo is a miniature of
 * the full game screen (message row, letter slots, the real 30-tile stack,
 * hint slider) driven by a phase ticker; all motion is CSS transitions off
 * the phase value. The stack renders the actual STACK_TEMPLATE and computes
 * exposure with the game's own `overlaps` rule, so pick scripts behave like
 * real play. Everything is aria-hidden: the caption text next to each demo
 * carries the meaning.
 */

export interface DemoLabels {
  /** Message-row label, e.g. "6 words left". */
  wordsLeft: string;
  /** Hint slider instruction, the same string the real game shows. */
  hintSlide: string;
  /** The progressive-disclosure invitation shown before the real slider. */
  hintRevealCta: string;
  /** The quiet cost note paired with the invitation. */
  hintRevealDetail: string;
  /** Clue text the hint demo reveals after the swipe. */
  hintClue: string;
}

const BLANKS = Array.from({ length: WORD_LENGTH }, () => "");
const EMPTY_SET: ReadonlySet<number> = new Set();

/** Board geometry, matching stackdown-game.tsx / .sd-tile. */
const TILE_PCT = 16;
const STEP_PCT = 9.5625;
const MARGIN_PCT = 3.75;

/** Plausible filler letters for tiles a demo doesn't care about. */
const FILLER = "MGFUWJLEYORBKSADPNITXQCVHZPWGL".split("");

function boardLetters(overrides: Record<number, string>): string[] {
  return STACK_TEMPLATE.map((_, index) => overrides[index] ?? FILLER[index]);
}

function tileStyle(index: number): { left: string; top: string; zIndex: number } {
  const position = STACK_TEMPLATE[index];
  return {
    left: `${MARGIN_PCT + STEP_PCT * position.x}%`,
    top: `${MARGIN_PCT + STEP_PCT * position.y}%`,
    zIndex: position.z + 1,
  };
}

function tileCenter(index: number): { left: string; top: string } {
  const position = STACK_TEMPLATE[index];
  return {
    left: `${MARGIN_PCT + STEP_PCT * position.x + TILE_PCT / 2}%`,
    top: `${MARGIN_PCT + STEP_PCT * position.y + TILE_PCT / 2}%`,
  };
}

function usePhase(count: number, stepMs: number): number {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setPhase((current) => (current + 1) % count),
      stepMs,
    );
    return () => window.clearInterval(id);
  }, [count, stepMs]);
  return phase;
}

function Slots({
  letters,
  shown,
  shake = false,
  solved = false,
  tapIndex,
}: {
  letters: string[];
  shown: boolean[];
  shake?: boolean;
  /** Success bounce, staggered per letter — mirrors the real game. */
  solved?: boolean;
  tapIndex?: number;
}) {
  return (
    <div
      className={`sdh-slots${shake ? " shake" : ""}${solved ? " solved" : ""}`}
    >
      {letters.map((letter, index) => (
        <div key={index} className="sdh-slot">
          <span
            className="sdh-slot-letter"
            data-hidden={!shown[index] || undefined}
            style={solved ? { animationDelay: `${index * 60}ms` } : undefined}
          >
            {letter}
            {tapIndex === index ? <span className="sdh-tap" aria-hidden /> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function slotsWith(...filled: Array<[number, boolean]>): boolean[] {
  const shown = Array.from({ length: WORD_LENGTH }, () => false);
  for (const [index, value] of filled) shown[index] = value;
  return shown;
}

/** The real 30-tile stack; exposure is computed live from what's left. */
function FullBoard({
  letters,
  removed,
  ringTile = null,
  cursorTile = null,
}: {
  letters: string[];
  removed: ReadonlySet<number>;
  ringTile?: number | null;
  cursorTile?: number | null;
}) {
  const present = STACK_TEMPLATE.map((_, index) => index).filter(
    (index) => !removed.has(index),
  );
  const exposed = new Set(
    present.filter(
      (index) =>
        !present.some(
          (other) =>
            other !== index &&
            overlaps(STACK_TEMPLATE[other], STACK_TEMPLATE[index]),
        ),
    ),
  );

  return (
    <div className="sdh-board-full">
      {STACK_TEMPLATE.map((position, index) => {
        const isExposed = exposed.has(index);
        return (
          <div
            key={index}
            className={`sdh-ftile${isExposed ? "" : " covered"}${
              removed.has(index) ? " gone" : ""
            }`}
            style={tileStyle(index)}
          >
            <span className="sdh-ftile-face">
              <span
                className="sdh-ftile-dim"
                style={{ opacity: isExposed ? 0 : 1 }}
                aria-hidden
              />
              <span
                className="sdh-ftile-letter"
                style={{ color: isExposed ? undefined : "hsl(50, 17%, 14%)" }}
              >
                {letters[index]}
              </span>
            </span>
            {ringTile === index ? <span className="sdh-tap" aria-hidden /> : null}
          </div>
        );
      })}
      <span
        className="sdh-cursor"
        style={{
          ...tileCenter(cursorTile ?? 0),
          opacity: cursorTile === null ? 0 : 1,
        }}
        aria-hidden
      />
    </div>
  );
}

/** Matches the real game's initial, deliberately secondary hint affordance. */
function HintDisclosure({ labels }: { labels: DemoLabels }) {
  return (
    <div className="sdh-hint-disclosure">
      <Sparkles className="size-3" aria-hidden />
      <span>{labels.hintRevealCta}</span>
      <small>{labels.hintRevealDetail}</small>
    </div>
  );
}

/** A miniature full game screen: message row, slots, the stack, hint bar. */
function DemoStage({
  message,
  found = false,
  slotLetters,
  slotShown,
  shake = false,
  solved = false,
  slotTap,
  letters,
  removed,
  ringTile,
  cursorTile,
  hint,
}: {
  message: string;
  /** Found-word styling for the message row (big, like the real game). */
  found?: boolean;
  slotLetters: string[];
  slotShown: boolean[];
  shake?: boolean;
  /** Slot success bounce when a word banks. */
  solved?: boolean;
  slotTap?: number;
  letters: string[];
  removed: ReadonlySet<number>;
  ringTile?: number | null;
  cursorTile?: number | null;
  hint: React.ReactNode;
}) {
  return (
    <div className="sdh-stage">
      <div className="sdh-game-header" aria-hidden>
        <span className="sdh-brand-glyph">
          <span />
          <span />
          <span />
        </span>
        <div className="sdh-game-copy">
          <span className="sdh-game-kicker">Stackdown</span>
          <p className={`sdh-message${found ? " found" : ""}`}>{message}</p>
        </div>
        <span className="sdh-progress">
          {found ? "1" : "0"}
          <span>/6</span>
        </span>
      </div>
      <FullBoard
        letters={letters}
        removed={removed}
        ringTile={ringTile}
        cursorTile={cursorTile}
      />
      <Slots
        letters={slotLetters}
        shown={slotShown}
        shake={shake}
        solved={solved}
        tapIndex={slotTap}
      />
      {hint}
    </div>
  );
}

/** Tap an exposed tile → it pops into a slot. */
export function DemoPick({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(4, 900);
  const picked = phase === 1 || phase === 2;
  return (
    <DemoStage
      message={labels.wordsLeft}
      slotLetters={["C", ...BLANKS.slice(1)]}
      slotShown={slotsWith([0, picked])}
      letters={boardLetters({ 26: "C" })}
      removed={picked ? new Set([26]) : EMPTY_SET}
      ringTile={phase === 0 ? 26 : null}
      cursorTile={phase <= 1 ? 26 : null}
      hint={<HintDisclosure labels={labels} />}
    />
  );
}

/** Lift a tile → the buried tile underneath turns bright. */
export function DemoUncover({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(4, 900);
  const lifted = phase === 1 || phase === 2;
  // Tile 26 (z3) sits directly over tile 18 (z2): lifting it frees the R.
  return (
    <DemoStage
      message={labels.wordsLeft}
      slotLetters={["T", ...BLANKS.slice(1)]}
      slotShown={slotsWith([0, lifted])}
      letters={boardLetters({ 26: "T", 18: "R" })}
      removed={lifted ? new Set([26]) : EMPTY_SET}
      ringTile={phase === 0 ? 26 : null}
      cursorTile={phase <= 1 ? 26 : null}
      hint={<HintDisclosure labels={labels} />}
    />
  );
}

/** Tiles picked in an order that's always legal: each is exposed when taken. */
const CRANE_PICKS = [26, 27, 18, 20, 28];

/** Fifth letter completes the word → success bounce → the slots clear. */
export function DemoWord({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(8, 800);
  const complete = phase === 5 || phase === 6;
  const cleared = phase >= 6;
  const removed = new Set(CRANE_PICKS.slice(0, Math.min(phase, WORD_LENGTH)));
  return (
    <DemoStage
      message={complete ? "CRANE" : labels.wordsLeft}
      found={complete}
      slotLetters={["C", "R", "A", "N", "E"]}
      slotShown={slotsWith(
        ...CRANE_PICKS.map((_, index): [number, boolean] => [
          index,
          phase > index && !cleared,
        ]),
      )}
      solved={phase === 5}
      letters={boardLetters({ 26: "C", 27: "R", 18: "A", 20: "N", 28: "E" })}
      removed={removed}
      ringTile={phase < WORD_LENGTH ? CRANE_PICKS[phase] : null}
      cursorTile={phase < WORD_LENGTH ? CRANE_PICKS[phase] : null}
      hint={<HintDisclosure labels={labels} />}
    />
  );
}

/**
 * Wrong word → the row shakes while every tile slides back to the stack, both
 * at once — the real game fires the shake and the return together.
 */
export function DemoWrong({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(8, 750);
  const returned = phase >= 5;
  const removed = returned
    ? EMPTY_SET
    : new Set(CRANE_PICKS.slice(0, Math.min(phase, WORD_LENGTH)));
  return (
    <DemoStage
      message={labels.wordsLeft}
      slotLetters={["C", "A", "R", "N", "E"]}
      slotShown={slotsWith(
        ...CRANE_PICKS.map((_, index): [number, boolean] => [
          index,
          phase > index && !returned,
        ]),
      )}
      shake={phase === 5}
      letters={boardLetters({ 26: "C", 27: "A", 18: "R", 20: "N", 28: "E" })}
      removed={removed}
      ringTile={phase < WORD_LENGTH ? CRANE_PICKS[phase] : null}
      cursorTile={phase < WORD_LENGTH ? CRANE_PICKS[phase] : null}
      hint={<HintDisclosure labels={labels} />}
    />
  );
}

/** Tap a slot letter → it returns, and everything picked after it follows. */
export function DemoUndo({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(4, 950);
  const returned = phase === 1 || phase === 2;
  // C R A came from tiles 26, 27, 18; tapping R sends R and A back.
  const removed = returned ? new Set([26]) : new Set([26, 27, 18]);
  return (
    <DemoStage
      message={labels.wordsLeft}
      slotLetters={["C", "R", "A", "", ""]}
      slotShown={slotsWith([0, true], [1, !returned], [2, !returned])}
      slotTap={phase === 0 ? 1 : undefined}
      letters={boardLetters({ 26: "C", 27: "R", 18: "A" })}
      removed={removed}
      hint={<HintDisclosure labels={labels} />}
    />
  );
}

/**
 * Swipe the slider → the current word's meaning clue is revealed. Mirrors the
 * real control: the instruction label shows until the reveal, and the handle
 * needs to pass 60% to trigger.
 */
export function DemoHint({ labels }: { labels: DemoLabels }) {
  const phase = usePhase(5, 950);
  const swiping = phase === 1;
  const revealed = phase >= 2;
  return (
    <DemoStage
      message={labels.wordsLeft}
      slotLetters={["B", "U", ...BLANKS.slice(2)]}
      slotShown={slotsWith([0, true], [1, true])}
      letters={boardLetters({ 26: "B", 27: "U" })}
      removed={new Set([26, 27])}
      hint={
        <div className="sdh-hint">
          <div
            className="sdh-hint-fill"
            style={{ width: swiping ? "62%" : "0%" }}
          />
          {revealed ? (
            <div className="sdh-hint-clue">{labels.hintClue}</div>
          ) : (
            <div className="sdh-hint-label">{labels.hintSlide}</div>
          )}
          <div
            className="sdh-hint-handle"
            style={{ left: swiping ? "62%" : "0.9rem" }}
          >
            <ChevronsRight className="size-3.5" aria-hidden />
          </div>
        </div>
      }
    />
  );
}
