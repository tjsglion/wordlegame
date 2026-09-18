"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useNextPuzzleCountdown } from "@/lib/game/use-next-puzzle-countdown";
import { useStackdown, type GameMode } from "./use-stackdown";
import {
  StackdownResultOverlay,
  StackdownSolvedWordsOverlay,
} from "./stackdown-overlays";
import { StackdownStage } from "./stackdown-stage";
import { useStackdownRoundActions } from "./use-stackdown-round-actions";
import { useStackdownTileFlights } from "./use-stackdown-tile-flights";

const WinConfetti = dynamic(
  () => import("@/components/game/win-confetti"),
  { ssr: false },
);

interface StackdownRoundProps {
  mode: GameMode;
  isAuthenticated: boolean;
  onNewRound: () => void;
  onPlayPractice: () => void;
  onBackToDaily: () => void;
}

/** Coordinates a round; stages, overlays, animation, and actions are isolated modules. */
export function StackdownRound({
  mode,
  isAuthenticated,
  onNewRound,
  onPlayPractice,
  onBackToDaily,
}: StackdownRoundProps) {
  const t = useTranslations("Stackdown");
  const game = useStackdown(mode, isAuthenticated);
  const [confettiDone, setConfettiDone] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [solvedWordsOpen, setSolvedWordsOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const finished = game.status === "won";
  const countdown = useNextPuzzleCountdown(mode === "daily" && finished);
  const animation = useStackdownTileFlights({
    tiles: game.tiles,
    slots: game.slots,
    returning: game.returning,
    returnFromIndex: game.returnFromIndex,
    shake: game.shake,
    completeReturn: game.completeReturn,
  });
  const actions = useStackdownRoundActions({
    game,
    mode,
    t,
    onCloseResult: () => setResultOpen(false),
  });

  useEffect(() => {
    if (!finished) return;

    const frame = window.requestAnimationFrame(() => {
      setSolvedWordsOpen(false);
      setResultOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [finished]);

  return (
    <>
      <StackdownStage
        game={game}
        mode={mode}
        animation={animation}
        copied={actions.copied}
        hintOpen={hintOpen}
        onOpenHint={() => setHintOpen(true)}
        onOpenSolvedWords={() => setSolvedWordsOpen(true)}
        onViewResult={() => setResultOpen(true)}
      />

      <StackdownSolvedWordsOverlay
        open={solvedWordsOpen}
        onClose={() => setSolvedWordsOpen(false)}
        solved={game.solved}
        totalWords={game.totalWords}
        wordTimesMs={game.wordTimesMs}
      />

      <StackdownResultOverlay
        open={finished && resultOpen}
        onClose={() => setResultOpen(false)}
        mode={mode}
        hintsUsed={game.hintsUsed}
        stats={game.stats}
        solved={game.solved}
        wordTimesMs={game.wordTimesMs}
        elapsedMs={game.elapsedMs}
        countdown={countdown}
        onShare={() => void actions.share()}
        onLeaderboard={() => void actions.openLeaderboard()}
        onNewRound={onNewRound}
        onPlayPractice={onPlayPractice}
        onBackToDaily={onBackToDaily}
      />

      <WinConfetti
        play={finished && game.justWon && !confettiDone}
        onDone={() => setConfettiDone(true)}
      />
    </>
  );
}
