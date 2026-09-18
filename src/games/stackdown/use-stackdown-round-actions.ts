"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { todayKey } from "@/lib/game/daily";
import { openStackdownStatsModal } from "@/games/stackdown/leaderboard";
import { formatTime, useStackdown, type GameMode } from "./use-stackdown";
import { stackdownStars } from "./shared";

type Translate = (key: "hintsUsed") => string;
type StackdownGame = ReturnType<typeof useStackdown>;

/** Encapsulates result-panel side effects without owning round presentation. */
export function useStackdownRoundActions({
  game,
  mode,
  t,
  onCloseResult,
}: {
  game: StackdownGame;
  mode: GameMode;
  t: Translate;
  onCloseResult: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  const openLeaderboard = useCallback(async () => {
    onCloseResult();
    await game.flushSync();
    openStackdownStatsModal();
  }, [game, onCloseResult]);

  const share = useCallback(async () => {
    const stars = "⭐".repeat(stackdownStars(game.hintsUsed));
    const label = mode === "daily" ? `Daily ${todayKey()}` : "Practice";
    const text = `Stackdown ${label} ${stars}\n⏱ ${formatTime(game.elapsedMs)} · ${game.solved.length}/${game.totalWords} · ${t("hintsUsed")}: ${game.hintsUsed}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
      } catch {
        // User dismissed the share sheet.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        copyTimeoutRef.current = null;
        setCopied(false);
      }, 1600);
    } catch {
      // Clipboard is unavailable.
    }
  }, [game, mode, t]);

  return { copied, openLeaderboard, share };
}
