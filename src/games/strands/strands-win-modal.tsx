"use client";

import { useTranslations } from "next-intl";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { useNextPuzzleCountdown } from "@/lib/game/use-next-puzzle-countdown";
import type { StrandsStats } from "./persistence";
import type { StrandsMode } from "./use-strands";

interface StrandsWinModalProps { open: boolean; mode: StrandsMode; hints: number; stats: StrandsStats; isWon: boolean; found: number; total: number; onClose: () => void; onShare: () => void; onPlayPractice: () => void; onBackToDaily: () => void; }

export function StrandsWinModal({ open, mode, hints, stats, isWon, found, total, onClose, onShare, onPlayPractice, onBackToDaily }: StrandsWinModalProps) {
  const t = useTranslations("Strands");
  const tCommon = useTranslations("Common");
  const countdown = useNextPuzzleCountdown(open && mode === "daily");
  const maxDistribution = Math.max(1, ...stats.hintDistribution);
  const currentBucket = Math.min(hints, stats.hintDistribution.length - 1);
  const lastBucket = stats.hintDistribution.length - 1;
  return (
    <GameModalShell
      open={open}
      onClose={onClose}
      variant="sheet"
      closeButtonAriaLabel={tCommon("close")}
      titleId="strands-win-title"
      descriptionId="strands-win-summary"
      classNames={{
        panel: "max-h-[calc(100dvh-1.5rem)] max-w-[23rem] overflow-y-auto px-[1.35rem] pt-8 pb-[1.35rem]",
        content: "text-center",
      }}
    >
      <p className="strands-modal-kicker">{isWon ? t("complete") : mode === "daily" ? t("modeDaily") : t("modePractice")}</p>
      <h2 id="strands-win-title" className="mt-[0.35rem] text-[2rem] leading-none font-semibold">
        {t("title")}
      </h2>
      <p id="strands-win-summary" className="mt-[0.3rem]">
        {isWon ? t("winSummary", { count: hints }) : t("progressSummary", { found, total })}
      </p>
      {mode === "daily" ? (
        <dl className="strands-modal-stats">
          <div>
            <dt>{t("stats.played")}</dt>
            <dd>{stats.played}</dd>
          </div>
          <div>
            <dt>{t("stats.streak")}</dt>
            <dd>{stats.currentStreak}</dd>
          </div>
          <div>
            <dt>{t("stats.best")}</dt>
            <dd>{stats.maxStreak}</dd>
          </div>
        </dl>
      ) : null}
      {mode === "daily" && stats.played > 0 ? (
        <div className="strands-modal-distribution" role="img" aria-label={t("hintsDistribution")}>
          <p className="strands-modal-kicker">{t("stats.hintsUsed")}</p>
          {stats.hintDistribution.map((count, index) => (
            <div key={index} className="strands-modal-distribution-row">
              <span className="w-4 text-right tabular-nums">{index === lastBucket ? `${lastBucket}+` : index}</span>
              <div
                className={index === currentBucket ? "strands-modal-bar is-current" : "strands-modal-bar"}
                style={{ width: `${Math.max(8, (count / maxDistribution) * 100)}%` }}
              />
              <span className="tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      ) : null}
      {mode === "daily" ? (
        <p className="mt-1 mb-4 text-center text-sm text-muted-foreground tabular-nums">
          {t("nextPuzzleIn", { time: countdown })}
        </p>
      ) : null}
      <button type="button" className="strands-share-button" onClick={onShare}>
        {t("share")}
      </button>
      {mode === "daily" ? (
        <button type="button" className="strands-mode-button" onClick={onPlayPractice}>
          {t("tryPractice")}
        </button>
      ) : (
        <button type="button" className="strands-mode-button" onClick={onBackToDaily}>
          {t("backToDaily")}
        </button>
      )}
    </GameModalShell>
  );
}
