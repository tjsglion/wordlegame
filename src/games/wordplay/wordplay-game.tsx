"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Check, Coins, LayoutGrid, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { WordplayBoard } from "./wordplay-board";
import { HINT_COST, LEVEL_COINS, LEVEL_COUNT, useWordplay } from "./use-wordplay";

// Client-only PixiJS celebration layer — see win-confetti.tsx.
const WinConfetti = dynamic(() => import("@/components/game/win-confetti"), {
  ssr: false,
});

export default function WordplayGame({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const t = useTranslations("Wordplay");
  const tCommon = useTranslations("Common");
  const game = useWordplay(isAuthenticated);
  const { state } = game;
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  // Level index of the completed run whose confetti already played — a new
  // completion on another level re-arms the celebration without an effect.
  const [confettiDoneFor, setConfettiDoneFor] = useState<number | null>(null);

  // Kill pull-to-refresh / overscroll bounce while a game is on screen.
  useEffect(() => {
    const { body } = document;
    const previous = body.style.overscrollBehavior;
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overscrollBehavior = previous;
    };
  }, []);

  useEffect(() => {
    if (!state.completeSummary) return;
    const frame = window.requestAnimationFrame(() => setResultOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [state.completeSummary]);

  const showConfetti = state.justCompleted && confettiDoneFor !== state.levelIndex;
  const foundTargets = new Set(state.foundTargets);
  const isFinalLevel = state.completeSummary?.level === LEVEL_COUNT;

  return (
    <div className="wordplay-game mx-auto flex w-full flex-1 touch-manipulation flex-col">
      <div className="wordplay-hud">
        <button
          type="button"
          className="wordplay-level-button"
          aria-label={t("levelBadgeAria", { level: state.levelNumber })}
          onClick={() => setLevelsOpen(true)}
        >
          <LayoutGrid aria-hidden />
          {t("level", { level: state.levelNumber })}
        </button>
        <div className="wordplay-hud-actions">
          <span
            className="wordplay-coins"
            aria-label={t("coinsAria", { count: state.coins })}
          >
            <Coins aria-hidden />
            {state.coins}
          </span>
          <button
            type="button"
            className="wordplay-hint-button"
            disabled={!state.canHint}
            aria-label={t("hintAria", { cost: HINT_COST })}
            onClick={game.useHint}
          >
            <Lightbulb aria-hidden />
            {t("hint")}
            <span className="wordplay-hint-cost">
              <Coins aria-hidden />
              {HINT_COST}
            </span>
          </button>
        </div>
      </div>

      {state.message ? (
        <div role="status" className="wordplay-toast">
          {state.message}
        </div>
      ) : null}

      <ul className="wordplay-slots" aria-label={t("targetsAria")}>
        {state.level.targets.map((word) => {
          const found = foundTargets.has(word);
          return (
            <li
              key={word}
              className={`wordplay-slot${found ? " is-found" : ""}`}
              aria-label={
                found
                  ? t("slotFoundAria", { word })
                  : t("slotHiddenAria", { count: word.length })
              }
            >
              {word.split("").map((letter, index) => (
                <span key={index} className="wordplay-slot-letter" aria-hidden>
                  {found ? letter : " "}
                </span>
              ))}
            </li>
          );
        })}
      </ul>

      <WordplayBoard
        level={state.level}
        path={state.path}
        errorPath={state.errorPath}
        hintCell={state.hintCell}
        locked={state.isLevelComplete}
        onPointerDown={game.pointerDown}
        onPointerMove={game.pointerMove}
        onPointerUp={game.pointerUp}
      />

      <div className="wordplay-bonus-row">
        <span
          className="wordplay-bonus-chip"
          aria-label={t("bonusChipAria", { count: state.foundBonus.length })}
        >
          <Coins aria-hidden />
          {t("bonusChip", { count: state.foundBonus.length })}
        </span>
      </div>

      <GameModalShell
        open={Boolean(state.completeSummary) && resultOpen}
        onClose={() => setResultOpen(false)}
        variant="sheet"
        closeButtonAriaLabel={tCommon("close")}
        titleId="wordplay-result-title"
        descriptionId="wordplay-result-description"
        classNames={{ panel: "max-w-sm" }}
      >
        <div className="flex flex-col gap-3">
          <p
            id="wordplay-result-title"
            className="pt-2 pr-10 pl-10 text-center font-semibold"
          >
            {isFinalLevel
              ? t("allCompleteTitle")
              : t("levelCompleteTitle", {
                  level: state.completeSummary?.level ?? state.levelNumber,
                })}
          </p>
          <div
            id="wordplay-result-description"
            className="flex flex-col gap-3"
          >
            {isFinalLevel ? (
              <p className="text-center text-sm text-muted-foreground">
                {t("allCompleteDescription", { count: LEVEL_COUNT })}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {t("coinsEarned", { count: LEVEL_COINS })}
                </p>
                <p className="text-muted-foreground">{t("coinsLabel")}</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {state.completeSummary?.bonusCount ?? 0}
                </p>
                <p className="text-muted-foreground">
                  {t("bonusFoundLabel")}
                </p>
              </div>
            </div>
            {!isFinalLevel ? (
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setResultOpen(false);
                  game.nextLevel();
                }}
              >
                {t("nextLevel")}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setResultOpen(false);
                game.replayLevel();
              }}
            >
              {t("replay")}
            </Button>
          </div>
        </div>
      </GameModalShell>

      <GameModalShell
        open={levelsOpen}
        onClose={() => setLevelsOpen(false)}
        variant="page"
        closeButtonAriaLabel={tCommon("close")}
        titleId="wordplay-levels-title"
      >
        <div className="wordplay-levels">
          <h2 id="wordplay-levels-title">{t("levelsTitle")}</h2>
          <div className="wordplay-level-grid">
            {Array.from({ length: LEVEL_COUNT }, (_, index) => {
              const levelNumber = index + 1;
              const locked = levelNumber > state.currentLevel;
              const done = Boolean(state.completed[String(levelNumber)]);
              const current = index === state.levelIndex;
              const ariaLabel = locked
                ? t("levelLockedAria", { level: levelNumber })
                : current
                  ? t("levelCurrentAria", { level: levelNumber })
                  : done
                    ? t("levelCompletedAria", { level: levelNumber })
                    : t("level", { level: levelNumber });
              const classes = [
                "wordplay-level-cell",
                done ? "is-completed" : "",
                current ? "is-current" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={levelNumber}
                  type="button"
                  className={classes}
                  disabled={locked}
                  aria-label={ariaLabel}
                  aria-current={current ? "true" : undefined}
                  onClick={() => {
                    game.selectLevel(index);
                    setLevelsOpen(false);
                  }}
                >
                  {locked ? <Lock aria-hidden /> : done ? <Check aria-hidden /> : levelNumber}
                </button>
              );
            })}
          </div>
        </div>
      </GameModalShell>

      <WinConfetti
        play={showConfetti}
        onDone={() => setConfettiDoneFor(state.levelIndex)}
      />
    </div>
  );
}
