"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { ChevronsRight, Flame, List, Sparkles, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { todayKey } from "@/lib/game/daily";
import { useNextPuzzleCountdown } from "@/lib/game/use-next-puzzle-countdown";
import { Button } from "@/components/ui/button";
import { useOverlayBehavior } from "@/components/ui/use-overlay-behavior";
import { usePathname, useRouter } from "@/i18n/navigation";
import { openStackdownStatsModal } from "@/games/stackdown/leaderboard";
import {
  formatTime,
  useStackdown,
  type BoardTile,
  type GameMode,
} from "./use-stackdown";
import { STAR_COUNT, WORD_LENGTH, stackdownStars } from "./shared";

// Client-only PixiJS celebration layer — see win-confetti.tsx.
const WinConfetti = dynamic(() => import("@/components/game/win-confetti"), {
  ssr: false,
});

/**
 * Board geometry, matching the original game's layout math: the pile lives
 * on a 9x9 half-step grid; a tile spans 16% of the board edge and steps
 * 9.5625% per grid unit, so tiles one unit apart physically overlap (that
 * overlap IS the covering rule) and tiles two units apart never touch.
 */
const TILE_SIZE_PCT = 100 / 6.25; // 16%
const GRID_MARGIN_PCT = 3.75;
const GRID_STEP_PCT = (TILE_SIZE_PCT + 100 / 32) / 2; // 9.5625%
const HINT_HANDLE_SIZE_REM = 2.85;
const HINT_HANDLE_SIDE_GAP_REM = 0.35;
const HINT_HANDLE_TRAVEL_REM =
  HINT_HANDLE_SIZE_REM + HINT_HANDLE_SIDE_GAP_REM * 2;
const HINT_REVEAL_THRESHOLD = 0.6;
const HINT_RECOIL_MS = 280;

function tilePosition(tile: BoardTile): { left: string; top: string } {
  return {
    left: `${GRID_MARGIN_PCT + GRID_STEP_PCT * tile.x}%`,
    top: `${GRID_MARGIN_PCT + GRID_STEP_PCT * tile.y}%`,
  };
}

/** One stat cell: plain value over a muted label. */
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

const StackdownSolvedWordsList = memo(function StackdownSolvedWordsList({
  solved,
  totalWords,
  wordTimesMs,
}: {
  solved: string[];
  totalWords: number;
  wordTimesMs: number[];
}) {
  const t = useTranslations("Stackdown");

  if (solved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
        {t("solvedWordsEmpty")}
      </div>
    );
  }

  return (
    <ol className="grid gap-2.5">
      {solved.map((word, index) => (
        <li
          key={`${word}-${index}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border/65 bg-background/45 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/80 text-xs font-bold tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <span className="truncate text-lg font-semibold uppercase tracking-[0.14em] text-foreground/96">
              {word}
            </span>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
            {formatTime(wordTimesMs[index] ?? 0)}
          </span>
        </li>
      ))}
      {solved.length < totalWords ? (
        <li className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border/55 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent"
            />
            <span className="truncate font-medium text-foreground/70">
              {t("currentWord", { index: solved.length + 1, total: totalWords })}
            </span>
          </div>
          <span aria-hidden className="shrink-0 text-sm tabular-nums opacity-0">
            00:00
          </span>
        </li>
      ) : null}
    </ol>
  );
});

const StackdownFinishedStage = memo(function StackdownFinishedStage({
  totalWords,
  hintsUsed,
  elapsedMs,
  onViewResult,
}: {
  totalWords: number;
  hintsUsed: number;
  elapsedMs: number;
  onViewResult: () => void;
}) {
  const t = useTranslations("Stackdown");

  return (
    <section className="sd-finished-stage">
      <div className="flex flex-col items-center text-center">
        <p className="sd-finished-eyebrow text-[0.7rem] font-semibold tracking-[0.24em] uppercase">
          {t("winMessage")}
        </p>
        <p className="sd-finished-summary mt-2 text-2xl font-black tracking-[0.08em]">
          {t("finishedStageSummary", { solved: totalWords, total: totalWords })}
        </p>
        <p className="sd-finished-hint mt-2 max-w-[18rem] text-sm leading-6">
          {t("finishedStageHint")}
        </p>
      </div>

      <div className="mt-4">
        <Stars hintsUsed={hintsUsed} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="sd-finished-stat text-center">
          <p className="sd-finished-stat-label text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
            {t("totalTime")}
          </p>
          <p className="sd-finished-stat-value mt-1 text-lg font-black tabular-nums">
            {formatTime(elapsedMs)}
          </p>
        </div>
        <div className="sd-finished-stat text-center">
          <p className="sd-finished-stat-label text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
            {t("hintsUsed")}
          </p>
          <p className="sd-finished-stat-value mt-1 text-lg font-black tabular-nums">
            {hintsUsed}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onViewResult}
        className="sd-finished-action mt-5 w-full"
      >
        {t("viewResult")}
      </Button>
    </section>
  );
});

function StackdownLoadingStage({
  label,
  error,
  retryLabel,
  onRetry,
}: {
  label: string;
  error: boolean;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className="sd-round mx-auto flex w-full max-w-xl flex-1 touch-manipulation flex-col justify-center px-4 py-5 sm:px-5 sm:py-7">
      <section className="sd-loading-scene" aria-live="polite">
        <div className="sd-loading-heading">
          <span className="sd-brand-glyph" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <p>{label}</p>
        </div>
        <div className="sd-loading-board" aria-hidden>
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        {error ? (
          <Button type="button" variant="outline" onClick={onRetry} className="sd-loading-retry">
            {retryLabel}
          </Button>
        ) : (
          <div className="sd-loading-answer" aria-hidden>
            {Array.from({ length: WORD_LENGTH }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stars({ hintsUsed }: { hintsUsed: number }) {
  const t = useTranslations("Stackdown");
  const filled = stackdownStars(hintsUsed);
  return (
    <div
      className="flex items-center justify-center gap-1"
      role="img"
      aria-label={t("a11y.stars", { filled })}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={`sd-star size-7 ${index < filled ? "filled" : "empty"}`}
        />
      ))}
    </div>
  );
}

/**
 * "Swipe to reveal" hint slider: drag the handle right; past the threshold the
 * current word's meaning clue is revealed. Springs back on release. Once the
 * clue is shown the slider locks (one hint per word).
 */
function HintSlider({
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

  useEffect(() => {
    return () => {
      if (recoilTimeoutRef.current !== null) {
        window.clearTimeout(recoilTimeoutRef.current);
      }
    };
  }, []);

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
        if (!dragging) return;
        updateFromPointer(event.clientX);
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
        if (!keyboarding || ratio === 0 || pending || revealed || awaitingReveal) {
          return;
        }
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
        // ARIA slider contract: arrow keys nudge the value; crossing the
        // same 60% threshold as the pointer path fires the hint.
        const STEP = 0.1;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = Math.min(1, ratio + STEP);
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
          const next = Math.max(0, ratio - STEP);
          setAwaitingReveal(false);
          setKeyboarding(next > 0);
          setRatio(next);
        }
      }}
    >
      <div className="sd-hint-fill" style={{ width: `${fillRatio * 100}%` }} />
      <div className="sd-hint-label">
        {revealed ? (
          <span className="sd-hint-clue" aria-live="polite">
            {clue}
          </span>
        ) : pending ? (
          <span aria-live="polite">{pendingLabel}</span>
        ) : (
          instruction
        )}
      </div>
      <div
        className="sd-hint-handle"
        style={{ left: handleLeft }}
        aria-hidden
      >
        <ChevronsRight className="size-4" />
      </div>
    </div>
  );
}

const StableHintSlider = memo(HintSlider);

const StackdownSlots = memo(function StackdownSlots({
  slots,
  shake,
  pending,
  solving,
  onUnpick,
}: {
  slots: Array<{ letter: string } | undefined>;
  shake: boolean;
  pending: boolean;
  solving: boolean;
  onUnpick: (slotIndex: number) => void;
}) {
  const t = useTranslations("Stackdown");

  return (
    <div
      className={`sd-slots ${shake ? "sd-shake" : ""} ${
        pending ? "sd-pending" : ""
      } ${
        solving ? "sd-solved" : ""
      }`}
      aria-live="polite"
      aria-busy={pending || undefined}
    >
      {Array.from({ length: WORD_LENGTH }).map((_, index) => {
        const slot = slots[index];
        return slot ? (
          <button
            key={index}
            type="button"
            className="sd-slot filled sd-pop"
            disabled={pending || solving}
            onClick={() => onUnpick(index)}
            aria-label={t("a11y.removeLetter", {
              letter: slot.letter.toUpperCase(),
            })}
          >
            <span
              className="sd-slot-letter"
              style={
                pending || solving ? { animationDelay: `${index * 60}ms` } : undefined
              }
            >
              {slot.letter}
            </span>
          </button>
        ) : (
          <div key={index} className="sd-slot" aria-hidden />
        );
      })}
    </div>
  );
});

const StackdownBoard = memo(function StackdownBoard({
  tiles,
  presentIds,
  exposed,
  finished,
  slotsLength,
  onPick,
}: {
  tiles: BoardTile[];
  presentIds: number[];
  exposed: ReadonlySet<number>;
  finished: boolean;
  slotsLength: number;
  onPick: (tileId: number) => void;
}) {
  const t = useTranslations("Stackdown");
  const presentSet = useMemo(() => new Set(presentIds), [presentIds]);

  return (
    <div className="sd-board" role="group" aria-label={t("a11y.board")}>
      {tiles
        .filter((tile) => presentSet.has(tile.id))
        .map((tile) => {
          const isExposed = exposed.has(tile.id);
          const style = {
            ...tilePosition(tile),
            zIndex: tile.z + 1,
          };
          return isExposed ? (
            <button
              key={tile.id}
              type="button"
              className="sd-tile exposed"
              style={style}
              disabled={finished || slotsLength >= WORD_LENGTH}
              onClick={() => onPick(tile.id)}
              aria-label={t("a11y.pickLetter", {
                letter: tile.letter.toUpperCase(),
              })}
            >
              <span className="sd-tile-surface">{tile.letter}</span>
            </button>
          ) : (
            <div
              key={tile.id}
              className="sd-tile covered"
              style={style}
              aria-hidden
            >
              <span className="sd-tile-surface">{tile.letter}</span>
            </div>
          );
        })}
    </div>
  );
});

function resolveMode(searchParams: ReturnType<typeof useSearchParams>): GameMode {
  return searchParams.get("mode") === "practice" ? "practice" : "daily";
}

function buildModeHref(pathname: string, mode: GameMode): string {
  return mode === "practice" ? `${pathname}?mode=practice` : pathname;
}

export default function StackdownGame({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const mode = resolveMode(searchParams);
  const [round, setRound] = useState(0);

  // Kill pull-to-refresh / overscroll bounce while a game is on screen.
  useEffect(() => {
    const { body } = document;
    const previous = body.style.overscrollBehavior;
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overscrollBehavior = previous;
    };
  }, []);

  const navigateToMode = useCallback(
    (nextMode: GameMode) => {
      router.replace(buildModeHref(pathname, nextMode), { scroll: false });
    },
    [pathname, router],
  );

  return (
    <StackdownRound
      key={`${mode}:${round}`}
      mode={mode}
      isAuthenticated={isAuthenticated}
      onNewRound={() => setRound((value) => value + 1)}
      onPlayPractice={() => navigateToMode("practice")}
      onBackToDaily={() => navigateToMode("daily")}
    />
  );
}

function StackdownRound({
  mode,
  isAuthenticated,
  onNewRound,
  onPlayPractice,
  onBackToDaily,
}: {
  mode: GameMode;
  isAuthenticated: boolean;
  onNewRound: () => void;
  onPlayPractice: () => void;
  onBackToDaily: () => void;
}) {
  const t = useTranslations("Stackdown");
  const tCommon = useTranslations("Common");
  const game = useStackdown(mode, isAuthenticated);
  const [confettiDone, setConfettiDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [solvedWordsOpen, setSolvedWordsOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const resultPortalRef = useRef<HTMLDivElement>(null);
  const solvedWordsPortalRef = useRef<HTMLDivElement>(null);

  const showConfetti = game.status === "won" && game.justWon && !confettiDone;
  const finished = game.status === "won";
  const countdown = useNextPuzzleCountdown(mode === "daily" && finished);
  const wordPending = game.submitting && !game.solving;

  useOverlayBehavior({
    open: resultOpen,
    portalRef: resultPortalRef,
    onClose: () => setResultOpen(false),
  });

  useOverlayBehavior({
    open: solvedWordsOpen,
    portalRef: solvedWordsPortalRef,
    onClose: () => setSolvedWordsOpen(false),
  });

  useEffect(() => {
    if (!finished) return;
    const frame = window.requestAnimationFrame(() => {
      setSolvedWordsOpen(false);
      setResultOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [finished]);

  const handleOpenLeaderboard = useCallback(async () => {
    setResultOpen(false);
    await game.flushSync();
    openStackdownStatsModal();
  }, [game]);

  const handleOpenSolvedWords = useCallback(() => {
    setSolvedWordsOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    const stars = "⭐".repeat(stackdownStars(game.hintsUsed));
    const label = mode === "daily" ? `Daily ${todayKey()}` : "Practice";
    const text = `Stackdown ${label} ${stars}\n⏱ ${formatTime(game.elapsedMs)} · ${game.solved.length}/${game.totalWords} · ${t("hintsUsed")}: ${game.hintsUsed}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
      } catch {
        // User dismissed the sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — stay silent.
    }
  }, [game, mode, t]);

  if (game.status === "loading" || game.status === "error") {
    return (
      <StackdownLoadingStage
        label={game.status === "loading" ? t("loading") : t("loadError")}
        error={game.status === "error"}
        retryLabel={t("retry")}
        onRetry={game.retry}
      />
    );
  }

  const wordsRemaining = game.totalWords - game.solved.length;

  return (
    <div className="sd-round mx-auto flex w-full max-w-xl flex-1 touch-manipulation flex-col justify-center px-4 py-5 sm:px-5 sm:py-7">
      <div className="sd-stage sd-stage-enter">
        {/* Toast notice */}
        <div className="relative h-0">
          {(game.notice || copied) && (
            <div
              role="status"
              className="sd-toast absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap px-3 py-2 text-sm font-bold shadow-lg"
            >
              {copied ? t("copied") : game.notice ? t(game.notice) : null}
            </div>
          )}
        </div>

        {/* Message row: words remaining / last word found + timer */}
        <div className="sd-game-header">
          <div className="sd-game-heading min-w-0">
            <span className="sd-brand-glyph" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <div className="min-w-0">
              <p className="sd-game-kicker">
                {mode === "daily" ? t("dailyStack") : t("practiceStack")}
              </p>
              <p className="sd-message" aria-live="polite">
                {wordPending ? (
                  <span className="sd-message-pending">{t("wordChecking")}</span>
                ) : game.hintPending ? (
                  <span className="sd-message-pending">{t("hintRevealing")}</span>
                ) : finished ? (
                  <span className="flex items-center gap-2">
                    <span className="sd-message-found">{t("winMessage")}</span>
                    <span className="sd-message-detail text-xs font-medium">
                      {t("finishedStageSummary", {
                        solved: game.solved.length,
                        total: game.totalWords,
                      })}
                    </span>
                  </span>
                ) : game.lastSolved && !finished ? (
                  <span className="flex flex-col justify-center">
                    <span className="sd-message-found leading-none">{game.lastSolved}</span>
                    <span className="sd-message-detail mt-1 text-[0.72rem] font-medium tracking-[0.16em]">
                      {t("wordsRemaining", { count: wordsRemaining })}
                    </span>
                  </span>
                ) : (
                  t("wordsRemaining", { count: wordsRemaining })
                )}
              </p>
            </div>
          </div>
          <div className="sd-game-tools flex items-center gap-1 text-sm tabular-nums">
            <button
              type="button"
              className="sd-progress-button"
              aria-label={t("openSolvedWords")}
              onClick={handleOpenSolvedWords}
            >
              <List aria-hidden className="size-4" />
              <span className="sd-progress-value">
                {game.solved.length}<span>/{game.totalWords}</span>
              </span>
            </button>
          </div>
        </div>

        {finished ? (
          <StackdownFinishedStage
            totalWords={game.totalWords}
            hintsUsed={game.hintsUsed}
            elapsedMs={game.elapsedMs}
            onViewResult={() => setResultOpen(true)}
          />
        ) : (
          <>
            {/* The stack leads the interaction; picked letters settle below it. */}
            <StackdownBoard
              tiles={game.tiles}
              presentIds={game.presentIds}
              exposed={game.exposed}
              finished={finished}
              slotsLength={game.slots.length}
              onPick={game.pick}
            />

            <StackdownSlots
              slots={game.slots}
              shake={game.shake}
              pending={wordPending}
              solving={game.solving}
              onUnpick={game.unpick}
            />

            {/* The hint stays out of the first action path until requested. */}
            {hintOpen || game.clue !== null || game.hintPending ? (
              <StableHintSlider
                disabled={game.submitting}
                pending={game.hintPending}
                clue={game.clue}
                instruction={t("hintSlide")}
                pendingLabel={t("hintRevealing")}
                onReveal={game.useHint}
              />
            ) : (
              <button
                type="button"
                className="sd-hint-disclosure"
                onClick={() => setHintOpen(true)}
              >
                <Sparkles className="size-4" aria-hidden />
                <span>{t("hintRevealCta")}</span>
                <small>{t("hintRevealDetail")}</small>
              </button>
            )}
          </>
        )}

      </div>

      {solvedWordsOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={solvedWordsPortalRef}
              className="fixed inset-0 z-[64]"
              aria-modal="true"
              role="dialog"
              aria-labelledby="stackdown-solved-words-title"
              tabIndex={-1}
            >
              <button
                type="button"
                aria-label={tCommon("close")}
                className="absolute inset-0 touch-none bg-black/28 backdrop-blur-[1px]"
                onClick={() => setSolvedWordsOpen(false)}
              />

              <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 pt-[max(4rem,env(safe-area-inset-top)+1rem)] sm:items-start sm:p-4">
                <div className="sd-sheet pointer-events-auto relative w-full max-w-md animate-in fade-in-0 zoom-in-95 px-5 pt-5 pb-6 text-foreground duration-150">
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-3 right-3 z-10 size-10 rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    aria-label={t("closeSolvedWords")}
                    data-overlay-close
                    data-overlay-initial-focus
                    onClick={() => setSolvedWordsOpen(false)}
                  >
                    <X aria-hidden />
                  </Button>

                  <div className="flex items-center gap-3 pr-12">
                    <p
                      id="stackdown-solved-words-title"
                      className="min-w-0 text-xl font-semibold text-foreground"
                    >
                      {t("progressTitle")}
                    </p>
                    <p className="shrink-0 rounded-full border border-border/70 bg-white/4 px-3 py-1 text-sm font-semibold tabular-nums text-foreground/90">
                      {game.solved.length}/{game.totalWords}
                    </p>
                  </div>

                  <div className="mt-5 max-h-[min(68vh,32rem)] overflow-y-auto">
                    <StackdownSolvedWordsList
                      solved={game.solved}
                      totalWords={game.totalWords}
                      wordTimesMs={game.wordTimesMs}
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {finished && resultOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={resultPortalRef}
              className="fixed inset-0 z-[65]"
              aria-modal="true"
              role="dialog"
              aria-labelledby="stackdown-result-title"
              tabIndex={-1}
            >
              <button
                type="button"
                aria-label={tCommon("close")}
                className="absolute inset-0 touch-none bg-black/32 backdrop-blur-[2px]"
                onClick={() => setResultOpen(false)}
              />

              <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4">
                <div className="sd-sheet pointer-events-auto relative w-full max-w-sm animate-in fade-in-0 zoom-in-95 p-4 duration-150">
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label={tCommon("close")}
                    data-overlay-close
                    data-overlay-initial-focus
                    onClick={() => setResultOpen(false)}
                  >
                    <X aria-hidden />
                  </Button>

                  <div className="wordle-panel-in flex flex-col gap-3">
                    <p
                      id="stackdown-result-title"
                      className="wordle-panel-in flex items-center justify-center gap-1.5 pt-2 pr-10 pl-10 text-center font-semibold"
                    >
                      {game.stats.currentStreak > 0 && mode === "daily" && (
                        <Flame className="size-4 text-brand" aria-hidden />
                      )}
                      {t("winMessage")}
                    </p>

                    <div
                      className="wordle-panel-in"
                      style={{ animationDelay: "80ms" }}
                    >
                      <Stars hintsUsed={game.hintsUsed} />
                    </div>

                    <div
                      className="wordle-panel-in grid grid-cols-3 gap-2 text-center text-xs"
                      style={{ animationDelay: "160ms" }}
                    >
                      <StatBlock
                        value={
                          game.stats.bestTimeMs === null
                            ? "—"
                            : formatTime(game.stats.bestTimeMs)
                        }
                        label={t("bestTime")}
                      />
                      <StatBlock
                        value={String(game.stats.currentStreak)}
                        label={t("stats.currentStreak")}
                      />
                      <StatBlock
                        value={String(game.stats.maxStreak)}
                        label={t("stats.maxStreak")}
                      />
                    </div>

                    {/* Timecard */}
                    <div
                      className="wordle-panel-in rounded-xl border border-border/80 bg-background px-3 py-2"
                      style={{ animationDelay: "240ms" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t("timecard")}
                      </p>
                      <ul className="mt-1 divide-y divide-border/60 text-sm">
                        {game.solved.map((word, index) => (
                          <li
                            key={`${word}-${index}`}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="font-medium uppercase tracking-wide">
                              {word}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {formatTime(game.wordTimesMs[index] ?? 0)}
                            </span>
                          </li>
                        ))}
                        <li className="flex items-center justify-between py-1 font-semibold">
                          <span>{t("totalTime")}</span>
                          <span className="tabular-nums">
                            {formatTime(game.elapsedMs)}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div
                      className="wordle-panel-in flex flex-col gap-3"
                      style={{ animationDelay: "320ms" }}
                    >
                      {mode === "daily" && (
                        <p className="text-center text-sm text-muted-foreground tabular-nums">
                          {t("nextPuzzleIn", { time: countdown })}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handleShare()}
                        className="w-full"
                      >
                        {t("share")}
                      </Button>
                      {mode === "daily" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => void handleOpenLeaderboard()}
                          className="w-full"
                        >
                          {t("viewLeaderboard")}
                        </Button>
                      ) : null}
                      {mode === "practice" ? (
                        <>
                          <Button
                            type="button"
                            onClick={onNewRound}
                            className="w-full"
                          >
                            {t("newPractice")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={onBackToDaily}
                            className="w-full"
                          >
                            {t("backToDaily")}
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={onPlayPractice}
                          className="w-full"
                        >
                          {t("tryPractice")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <WinConfetti play={showConfetti} onDone={() => setConfettiDone(true)} />
    </div>
  );
}
