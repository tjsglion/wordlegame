"use client";

import { List, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatTime, useStackdown, type GameMode } from "./use-stackdown";
import { WORD_LENGTH } from "./shared";
import { StackdownBoard, StackdownSlots } from "./stackdown-board";
import { StackdownHintSlider } from "./stackdown-hint-slider";
import { StackdownStars } from "./stackdown-stars";
import {
  StackdownTileFlights,
  useStackdownTileFlights,
} from "./use-stackdown-tile-flights";

type StackdownGame = Pick<
  ReturnType<typeof useStackdown>,
  | "status"
  | "tiles"
  | "presentIds"
  | "slots"
  | "solved"
  | "lastSolved"
  | "hintsUsed"
  | "clue"
  | "notice"
  | "shake"
  | "returning"
  | "returnFromIndex"
  | "solving"
  | "submitting"
  | "settlingFinalPick"
  | "hintPending"
  | "elapsedMs"
  | "totalWords"
  | "pick"
  | "unpick"
  | "useHint"
  | "retry"
>;

type StackdownAnimation = Pick<
  ReturnType<typeof useStackdownTileFlights>,
  | "boardRef"
  | "slotRefs"
  | "flights"
  | "flyingTileIds"
  | "returnDelays"
  | "pick"
  | "isPickPending"
  | "completeFlight"
>;

interface LoadingStageProps {
  label: string;
  error: boolean;
  retryLabel: string;
  onRetry: () => void;
}

function LoadingStage({
  label,
  error,
  retryLabel,
  onRetry,
}: LoadingStageProps) {
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
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="sd-loading-retry"
          >
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

function FinishedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sd-finished-stat text-center">
      <p className="sd-finished-stat-label text-[0.65rem] font-semibold tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="sd-finished-stat-value mt-1 text-lg font-black tabular-nums">
        {value}
      </p>
    </div>
  );
}

function FinishedStage({
  hintsUsed,
  elapsedMs,
  totalWords,
  onViewResult,
}: {
  hintsUsed: number;
  elapsedMs: number;
  totalWords: number;
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
          {t("finishedStageSummary", {
            solved: totalWords,
            total: totalWords,
          })}
        </p>
        <p className="sd-finished-hint mt-2 max-w-[18rem] text-sm leading-6">
          {t("finishedStageHint")}
        </p>
      </div>

      <div className="mt-4">
        <StackdownStars hintsUsed={hintsUsed} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <FinishedStat label={t("totalTime")} value={formatTime(elapsedMs)} />
        <FinishedStat label={t("hintsUsed")} value={String(hintsUsed)} />
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
}

function StageToast({
  notice,
  copied,
}: {
  notice: StackdownGame["notice"];
  copied: boolean;
}) {
  const t = useTranslations("Stackdown");
  if (!notice && !copied) return null;

  return (
    <div
      role="status"
      className="sd-toast absolute top-0 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap px-3 py-2 text-sm font-bold shadow-lg"
    >
      {copied ? t("copied") : notice ? t(notice) : null}
    </div>
  );
}

function StageMessage({
  game,
  wordPending,
}: {
  game: StackdownGame;
  wordPending: boolean;
}) {
  const t = useTranslations("Stackdown");
  const wordsRemaining = game.totalWords - game.solved.length;

  if (wordPending) {
    return <span className="sd-message-pending">{t("wordChecking")}</span>;
  }
  if (game.hintPending) {
    return <span className="sd-message-pending">{t("hintRevealing")}</span>;
  }
  if (game.status === "won") {
    return (
      <span className="flex items-center gap-2">
        <span className="sd-message-found">{t("winMessage")}</span>
        <span className="sd-message-detail text-xs font-medium">
          {t("finishedStageSummary", {
            solved: game.solved.length,
            total: game.totalWords,
          })}
        </span>
      </span>
    );
  }
  if (game.lastSolved) {
    return (
      <span className="flex flex-col justify-center">
        <span className="sd-message-found leading-none">{game.lastSolved}</span>
        <span className="sd-message-detail mt-1 text-[0.72rem] font-medium tracking-[0.16em]">
          {t("wordsRemaining", { count: wordsRemaining })}
        </span>
      </span>
    );
  }

  return t("wordsRemaining", { count: wordsRemaining });
}

function StageHeader({
  game,
  mode,
  wordPending,
  onOpenSolvedWords,
}: {
  game: StackdownGame;
  mode: GameMode;
  wordPending: boolean;
  onOpenSolvedWords: () => void;
}) {
  const t = useTranslations("Stackdown");

  return (
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
            <StageMessage game={game} wordPending={wordPending} />
          </p>
        </div>
      </div>

      <div className="sd-game-tools flex items-center gap-1 text-sm tabular-nums">
        <button
          type="button"
          className="sd-progress-button"
          aria-label={t("openSolvedWords")}
          onClick={onOpenSolvedWords}
        >
          <List aria-hidden className="size-4" />
          <span className="sd-progress-value">
            {game.solved.length}
            <span>/{game.totalWords}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function ActiveStage({
  game,
  animation,
  wordPending,
  hintOpen,
  onOpenHint,
}: {
  game: StackdownGame;
  animation: StackdownAnimation;
  wordPending: boolean;
  hintOpen: boolean;
  onOpenHint: () => void;
}) {
  const t = useTranslations("Stackdown");
  const hintVisible = hintOpen || game.clue !== null || game.hintPending;

  return (
    <>
      <StackdownBoard
        tiles={game.tiles}
        presentIds={game.presentIds}
        finished={false}
        slotsLength={game.slots.length}
        flyingPickIds={animation.flyingTileIds}
        pickPending={animation.isPickPending}
        boardRef={animation.boardRef}
        onPick={(tileId, element) => animation.pick(tileId, element, game.pick)}
      />

      <StackdownSlots
        slots={game.slots}
        shake={game.shake}
        returning={game.returning}
        returnFromIndex={game.returnFromIndex}
        returnDelays={animation.returnDelays}
        pending={wordPending || game.settlingFinalPick}
        solving={game.solving}
        pickPending={animation.isPickPending}
        slotRefs={animation.slotRefs}
        onUnpick={game.unpick}
      />

      {hintVisible ? (
        <StackdownHintSlider
          disabled={game.submitting || game.settlingFinalPick || animation.isPickPending}
          pending={game.hintPending}
          clue={game.clue}
          instruction={t("hintSlide")}
          pendingLabel={t("hintRevealing")}
          onReveal={game.useHint}
        />
      ) : (
        <button type="button" className="sd-hint-disclosure" onClick={onOpenHint}>
          <Sparkles className="size-4" aria-hidden />
          <span>{t("hintRevealCta")}</span>
          <small>{t("hintRevealDetail")}</small>
        </button>
      )}
    </>
  );
}

interface StackdownStageProps {
  game: StackdownGame;
  mode: GameMode;
  animation: StackdownAnimation;
  copied: boolean;
  hintOpen: boolean;
  onOpenHint: () => void;
  onOpenSolvedWords: () => void;
  onViewResult: () => void;
}

/** Renders only the current Stackdown stage; round state and side effects stay outside. */
export function StackdownStage({
  game,
  mode,
  animation,
  copied,
  hintOpen,
  onOpenHint,
  onOpenSolvedWords,
  onViewResult,
}: StackdownStageProps) {
  const t = useTranslations("Stackdown");
  const finished = game.status === "won";
  const wordPending = game.submitting && !game.solving && !game.returning;

  if (game.status === "loading" || game.status === "error") {
    return (
      <LoadingStage
        label={game.status === "loading" ? t("loading") : t("loadError")}
        error={game.status === "error"}
        retryLabel={t("retry")}
        onRetry={game.retry}
      />
    );
  }

  return (
    <div className="sd-round mx-auto flex w-full max-w-xl flex-1 touch-manipulation flex-col justify-center px-4 py-5 sm:px-5 sm:py-7">
      <StackdownTileFlights flights={animation.flights} onFlightEnd={animation.completeFlight} />

      <div className="sd-stage sd-stage-enter">
        <StageToast notice={game.notice} copied={copied} />
        <StageHeader
          game={game}
          mode={mode}
          wordPending={wordPending}
          onOpenSolvedWords={onOpenSolvedWords}
        />

        {finished ? (
          <FinishedStage
            hintsUsed={game.hintsUsed}
            elapsedMs={game.elapsedMs}
            totalWords={game.totalWords}
            onViewResult={onViewResult}
          />
        ) : (
          <ActiveStage
            game={game}
            animation={animation}
            wordPending={wordPending}
            hintOpen={hintOpen}
            onOpenHint={onOpenHint}
          />
        )}
      </div>
    </div>
  );
}
