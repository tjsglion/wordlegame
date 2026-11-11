"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { BarChart3, Flame, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { todayKey } from "@/lib/game/daily";
import { useNextPuzzleCountdown } from "@/lib/game/use-next-puzzle-countdown";
import { Button } from "@/components/ui/button";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { usePathname, useRouter } from "@/i18n/navigation";
import { openWordleStatsModal } from "@/games/wordle/leaderboard";
import { Board } from "./board";
import { Keyboard } from "./keyboard";
import { MAX_GUESSES, useWordle, type GameMode, type NoticeKey } from "./use-wordle";
import { LETTER_STATE_EMOJI } from "./shared";

// Client-only PixiJS celebration layer — see win-confetti.tsx.
const WinConfetti = dynamic(() => import("@/components/game/win-confetti"), {
  ssr: false,
});

/**
 * Ease-out count-up from 0 to `target`, run once when the settlement panel
 * mounts. rAF-driven so it stays transform/opacity-free and cheap.
 */
function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** One stat cell: count-up number over a muted label. */
function StatBlock({ value, label }: { value: number; label: string }) {
  const display = useCountUp(value);
  return (
    <div>
      <p className="text-lg font-bold tabular-nums">{display}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

function resolveMode(searchParams: ReturnType<typeof useSearchParams>): GameMode {
  return searchParams.get("mode") === "practice" ? "practice" : "daily";
}

function buildModeHref(pathname: string, mode: GameMode): string {
  return mode === "practice" ? `${pathname}?mode=practice` : pathname;
}

export default function WordleGame({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const mode = resolveMode(searchParams);

  // Kill pull-to-refresh / overscroll bounce while a game is on screen
  // (scoped to the game container's lifetime, restored on unmount).
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

  // No permanent mode chrome: practice is offered contextually in the
  // settlement panel once the daily round ends.
  return (
    <WordleRound
      key={mode}
      mode={mode}
      isAuthenticated={isAuthenticated}
      onPlayPractice={() => navigateToMode("practice")}
      onBackToDaily={() => navigateToMode("daily")}
    />
  );
}

function WordleRound({
  mode,
  isAuthenticated,
  onPlayPractice,
  onBackToDaily,
}: {
  mode: GameMode;
  isAuthenticated: boolean;
  onPlayPractice: () => void;
  onBackToDaily: () => void;
}) {
  const t = useTranslations("Wordle");
  const tCommon = useTranslations("Common");
  const game = useWordle(mode, isAuthenticated);
  const [confettiDone, setConfettiDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  // Confetti plays only for a win that just happened this session — a
  // refreshed (restored) won round skips the celebration entirely.
  const showConfetti = game.status === "won" && game.justWon && !confettiDone;

  const finished = game.status !== "playing";
  const attemptsUsed = game.guesses.length;
  const countdown = useNextPuzzleCountdown(mode === "daily" && finished);
  const winRate =
    game.stats.played > 0
      ? Math.round((game.stats.wins / game.stats.played) * 100)
      : 0;
  const maxDistribution = Math.max(1, ...game.stats.distribution);
  // Highlight the distribution row matching this round's guess count.
  const highlightIndex = game.status === "won" ? game.guesses.length - 1 : -1;

  // Result copy shared by the toast notice and the settlement panel.
  const resultText =
    game.status === "won"
      ? t("winMessage")
      : game.status === "lost"
        ? t("loseMessage", { answer: game.answer?.toUpperCase() ?? "" })
        : null;
  /** Toast copy for a notice key; win/lose reuse the shared result text. */
  const noticeText = (key: NoticeKey): string =>
    key === "winMessage" || key === "loseMessage"
      ? (resultText ?? t(key))
      : t(key);

  useEffect(() => {
    if (!finished) return;

    const frame = window.requestAnimationFrame(() => setResultOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [finished]);

  const handleViewLeaderboard = useCallback(async () => {
    await game.flushSync();
    openWordleStatsModal();
  }, [game]);

  const handleOpenLeaderboard = useCallback(async () => {
    setResultOpen(false);
    await handleViewLeaderboard();
  }, [handleViewLeaderboard]);

  // Classic emoji-square share card; native share sheet when available,
  // clipboard + toast otherwise.
  const handleShare = useCallback(async () => {
    const lines = game.results.map((row) =>
      row.map((state) => LETTER_STATE_EMOJI[state]).join(""),
    );
    const score =
      game.status === "won"
        ? `${game.guesses.length}/${MAX_GUESSES}`
        : `X/${MAX_GUESSES}`;
    const title = mode === "daily" ? `LetterLoop Daily Guess ${todayKey()}` : "LetterLoop Practice Guess";
    const text = `${title} ${score}\n${lines.join("\n")}`;

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
      // Clipboard unavailable (permissions, insecure context) — stay silent.
    }
  }, [game.results, game.status, game.guesses.length, mode]);

  const handleRestartPractice = useCallback(() => {
    setResultOpen(false);
    game.restart();
  }, [game]);

  const handlePlayPractice = useCallback(() => {
    setResultOpen(false);
    onPlayPractice();
  }, [onPlayPractice]);

  const handleReturnToDaily = useCallback(() => {
    setResultOpen(false);
    onBackToDaily();
  }, [onBackToDaily]);

  return (
    <div className="wordle-stage mx-auto flex w-full max-w-lg flex-1 touch-manipulation flex-col px-3 py-3 sm:px-4">
      <div className="wordle-quest-hud">
        <div className="wordle-quest-intro">
          <span className="wordle-quest-marker" aria-hidden />
          <div className="min-w-0">
            <p className="wordle-round-kicker">
              {mode === "daily" ? t("dailyQuest") : t("practiceQuest")}
            </p>
            <h2 className="wordle-quest-objective">
              {t("questObjective", { total: MAX_GUESSES })}
            </h2>
          </div>
        </div>

        <div className="wordle-quest-status">
          <p className="wordle-streak">
            <Flame aria-hidden />
            {game.stats.currentStreak > 0
              ? t("streak", { count: game.stats.currentStreak })
              : t("startStreak")}
          </p>
          <ol
            className="wordle-attempts"
            aria-label={t("roundProgress", { current: attemptsUsed, total: MAX_GUESSES })}
          >
            {Array.from({ length: MAX_GUESSES }, (_, index) => (
              <li
                key={index}
                className={index < attemptsUsed ? "is-complete" : undefined}
              />
            ))}
          </ol>
          <p className="wordle-round-progress" aria-live="polite">
            {t("roundProgress", { current: attemptsUsed, total: MAX_GUESSES })}
          </p>
        </div>
      </div>

      {/* Toast notice */}
      <div className="relative h-0">
        {(game.notice || copied) && (
          <div
            role="status"
            className="absolute left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-3 py-2 text-sm font-medium whitespace-nowrap text-background shadow-lg"
          >
            {copied ? t("copied") : game.notice ? noticeText(game.notice) : null}
          </div>
        )}
      </div>

      {/* my-auto centers the board+keyboard group without justify-center's
       * top-clipping: on short viewports the auto margins collapse to zero
       * and the group flows from the top instead of being cut off. */}
      <div className="wordle-play-area my-auto flex w-full flex-col gap-6">
        <Board
          guesses={game.guesses}
          results={game.results}
          current={game.current}
          status={game.status}
          shake={game.shake}
          submitting={game.submitting}
          revealing={game.revealing}
          celebrate={game.justWon}
          skipFlipAnim={game.skipFlipAnim}
        />

        {/* The slot is always mounted — the button is only toggled invisible.
         * Unmounting it (on finish or on dialog open) would change the
         * my-auto centered group's height and make the whole board jump. */}
        <div
          className={`flex justify-center gap-2 ${!finished || resultOpen ? "invisible" : ""}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => setResultOpen(true)}
          >
            <BarChart3 aria-hidden />
            {t("resultsCta")}
          </Button>
          <Button type="button" onClick={() => void handleShare()}>
            <Share2 aria-hidden />
            {t("shareCta")}
          </Button>
        </div>

        <div>
          <Keyboard
            letterStates={game.letterStates}
            onChar={game.onChar}
            onDelete={game.onDelete}
            onEnter={game.submitGuess}
            disabled={finished || game.submitting || game.revealing}
            enterLabel={t("enter")}
            deleteLabel={t("delete")}
          />
        </div>
      </div>

      <GameModalShell
        open={finished && resultOpen}
        onClose={() => setResultOpen(false)}
        variant="sheet"
        closeButtonAriaLabel={tCommon("close")}
        titleId="wordle-result-title"
        descriptionId="wordle-result-description"
        classNames={{
          panel:
            "max-w-sm border-[oklch(0.72_0.075_98_/_0.24)] bg-[linear-gradient(180deg,oklch(0.22_0.022_157_/_0.98),oklch(0.17_0.02_155_/_0.98))] text-[oklch(0.94_0.017_92)] shadow-[0_30px_90px_-28px_rgba(0,0,0,0.62)]",
        }}
      >
        <div className="wordle-panel-in flex flex-col gap-3">
          <p className="wordle-panel-in text-center text-[11px] font-medium tracking-[0.24em] text-[oklch(0.77_0.073_95)] uppercase">
            {mode === "daily" ? t("dailyQuest") : t("practiceQuest")}
          </p>
          <p
            id="wordle-result-title"
            className="wordle-panel-in flex items-center justify-center gap-1.5 px-10 text-center text-lg font-semibold"
          >
            {game.stats.currentStreak > 0 && (
              <Flame className="size-4 text-brand" aria-hidden />
            )}
            {resultText}
          </p>

          <div
            className="wordle-panel-in grid grid-cols-4 gap-2 rounded-[1.2rem] border border-white/10 bg-white/6 p-3 text-center text-xs"
            style={{ animationDelay: "80ms" }}
          >
            <StatBlock value={game.stats.played} label={t("stats.played")} />
            <StatBlock value={winRate} label={t("stats.winRate")} />
            <StatBlock
              value={game.stats.currentStreak}
              label={t("stats.currentStreak")}
            />
            <StatBlock
              value={game.stats.maxStreak}
              label={t("stats.maxStreak")}
            />
          </div>

          <div
            className="wordle-panel-in flex flex-col gap-1 rounded-[1rem] border border-white/8 bg-black/10 p-3"
            style={{ animationDelay: "160ms" }}
          >
            {game.stats.distribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right tabular-nums">{i + 1}</span>
                <div
                  className={`h-4 rounded-sm ${
                    i === highlightIndex
                      ? "bg-wordle-correct"
                      : "bg-muted-foreground/40"
                  }`}
                  style={{
                    width: `${Math.max(8, (count / maxDistribution) * 100)}%`,
                  }}
                />
                <span className="tabular-nums">{count}</span>
              </div>
            ))}
          </div>

          <div
            id="wordle-result-description"
            className="wordle-panel-in flex flex-col gap-3"
            style={{ animationDelay: "240ms" }}
          >
            {mode === "daily" && (
              <p className="text-center text-sm text-[oklch(0.8_0.03_92)] tabular-nums">
                {t("nextPuzzleIn", { time: countdown })}
              </p>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleShare()}
              className="w-full bg-[oklch(0.72_0.1_84)] text-[oklch(0.19_0.021_154)] hover:bg-[oklch(0.76_0.1_84)]"
            >
              {t("share")}
            </Button>
            {mode === "daily" ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleOpenLeaderboard()}
                className="w-full text-[oklch(0.9_0.02_92)] hover:bg-white/8 hover:text-white"
              >
                {t("viewLeaderboard")}
              </Button>
            ) : null}
            {mode === "practice" ? (
              <>
                <Button type="button" onClick={handleRestartPractice} className="w-full bg-white/10 text-white hover:bg-white/14">
                  {t("newPractice")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReturnToDaily}
                  className="w-full text-[oklch(0.9_0.02_92)] hover:bg-white/8 hover:text-white"
                >
                  {t("backToDaily")}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handlePlayPractice} className="w-full bg-white/10 text-white hover:bg-white/14">
                {t("tryPractice")}
              </Button>
            )}
          </div>
        </div>
      </GameModalShell>

      <WinConfetti play={showConfetti} onDone={() => setConfettiDone(true)} />
    </div>
  );
}
