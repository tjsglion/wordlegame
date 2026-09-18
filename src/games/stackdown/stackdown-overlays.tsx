"use client";

import { memo } from "react";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { formatTime, type StackdownStats } from "./use-stackdown";
import type { GameMode } from "./shared";
import { StackdownStars } from "./stackdown-stars";

const SOLVED_WORDS_SHEET_CLASS_NAMES = {
  overlay: "bg-black/28 backdrop-blur-[1px]",
  panel: "sd-sheet animate-in fade-in-0 zoom-in-95 duration-150",
} as const;

const RESULT_SHEET_CLASS_NAMES = {
  overlay: "bg-black/32 backdrop-blur-[2px]",
  panel: "sd-sheet animate-in fade-in-0 zoom-in-95 duration-150",
} as const;

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

const SolvedWordsList = memo(function SolvedWordsList({
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

export function StackdownSolvedWordsOverlay({
  open,
  onClose,
  solved,
  totalWords,
  wordTimesMs,
}: {
  open: boolean;
  onClose: () => void;
  solved: string[];
  totalWords: number;
  wordTimesMs: number[];
}) {
  const t = useTranslations("Stackdown");

  return (
    <GameModalShell
      open={open}
      onClose={onClose}
      variant="sheet"
      closeButtonAriaLabel={t("closeSolvedWords")}
      titleId="stackdown-solved-words-title"
      classNames={{
        ...SOLVED_WORDS_SHEET_CLASS_NAMES,
        root: "z-[64]",
        frame:
          "pointer-events-none absolute inset-0 flex items-end justify-center p-3 pt-[max(4rem,env(safe-area-inset-top)+1rem)] sm:items-start sm:p-4",
        panel: `${SOLVED_WORDS_SHEET_CLASS_NAMES.panel} max-w-md px-5 pt-5 pb-6`,
        closeButton: "top-3 right-3 size-10 hover:bg-muted/70 hover:text-foreground",
      }}
    >
      <div className="flex items-center gap-3 pr-12">
        <p id="stackdown-solved-words-title" className="min-w-0 text-xl font-semibold text-foreground">
          {t("progressTitle")}
        </p>
        <p className="shrink-0 rounded-full border border-border/70 bg-white/4 px-3 py-1 text-sm font-semibold tabular-nums text-foreground/90">
          {solved.length}/{totalWords}
        </p>
      </div>
      <div className="mt-5 max-h-[min(68vh,32rem)] overflow-y-auto">
        <SolvedWordsList solved={solved} totalWords={totalWords} wordTimesMs={wordTimesMs} />
      </div>
    </GameModalShell>
  );
}

export function StackdownResultOverlay({
  open,
  onClose,
  mode,
  hintsUsed,
  stats,
  solved,
  wordTimesMs,
  elapsedMs,
  countdown,
  onShare,
  onLeaderboard,
  onNewRound,
  onPlayPractice,
  onBackToDaily,
}: {
  open: boolean;
  onClose: () => void;
  mode: GameMode;
  hintsUsed: number;
  stats: StackdownStats;
  solved: string[];
  wordTimesMs: number[];
  elapsedMs: number;
  countdown: string;
  onShare: () => void;
  onLeaderboard: () => void;
  onNewRound: () => void;
  onPlayPractice: () => void;
  onBackToDaily: () => void;
}) {
  const t = useTranslations("Stackdown");
  const tCommon = useTranslations("Common");

  return (
    <GameModalShell
      open={open}
      onClose={onClose}
      variant="sheet"
      closeButtonAriaLabel={tCommon("close")}
      titleId="stackdown-result-title"
      classNames={{
        ...RESULT_SHEET_CLASS_NAMES,
        panel: `${RESULT_SHEET_CLASS_NAMES.panel} max-w-sm`,
      }}
    >
      <div className="wordle-panel-in flex flex-col gap-3">
        <p
          id="stackdown-result-title"
          className="wordle-panel-in flex items-center justify-center gap-1.5 pt-2 pr-10 pl-10 text-center font-semibold"
        >
          {stats.currentStreak > 0 && mode === "daily" ? (
            <Flame className="size-4 text-brand" aria-hidden />
          ) : null}
          {t("winMessage")}
        </p>
        <div className="wordle-panel-in" style={{ animationDelay: "80ms" }}>
          <StackdownStars hintsUsed={hintsUsed} />
        </div>
        <div className="wordle-panel-in grid grid-cols-3 gap-2 text-center text-xs" style={{ animationDelay: "160ms" }}>
          <StatBlock value={stats.bestTimeMs === null ? "—" : formatTime(stats.bestTimeMs)} label={t("bestTime")} />
          <StatBlock value={String(stats.currentStreak)} label={t("stats.currentStreak")} />
          <StatBlock value={String(stats.maxStreak)} label={t("stats.maxStreak")} />
        </div>
        <div className="wordle-panel-in rounded-xl border border-border/80 bg-background px-3 py-2" style={{ animationDelay: "240ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("timecard")}</p>
          <ul className="mt-1 divide-y divide-border/60 text-sm">
            {solved.map((word, index) => (
              <li key={`${word}-${index}`} className="flex items-center justify-between py-1">
                <span className="font-medium uppercase tracking-wide">{word}</span>
                <span className="tabular-nums text-muted-foreground">{formatTime(wordTimesMs[index] ?? 0)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between py-1 font-semibold">
              <span>{t("totalTime")}</span>
              <span className="tabular-nums">{formatTime(elapsedMs)}</span>
            </li>
          </ul>
        </div>
        <div className="wordle-panel-in flex flex-col gap-3" style={{ animationDelay: "320ms" }}>
          {mode === "daily" ? <p className="text-center text-sm text-muted-foreground tabular-nums">{t("nextPuzzleIn", { time: countdown })}</p> : null}
          <Button type="button" variant="outline" onClick={onShare} className="w-full">{t("share")}</Button>
          {mode === "daily" ? <Button type="button" variant="ghost" onClick={onLeaderboard} className="w-full">{t("viewLeaderboard")}</Button> : null}
          {mode === "practice" ? <><Button type="button" onClick={onNewRound} className="w-full">{t("newPractice")}</Button><Button type="button" variant="ghost" onClick={onBackToDaily} className="w-full">{t("backToDaily")}</Button></> : <Button type="button" onClick={onPlayPractice} className="w-full">{t("tryPractice")}</Button>}
        </div>
      </div>
    </GameModalShell>
  );
}
