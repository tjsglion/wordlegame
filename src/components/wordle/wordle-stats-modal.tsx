"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Flame, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { openLoginModal } from "@/components/auth/login-dialog";
import { GameModalShell } from "@/components/game/game-modal-shell";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  OPEN_WORDLE_STATS_EVENT,
  type WordleLeaderboardEntry,
  type WordleLeaderboardResponse,
} from "@/games/wordle/leaderboard";
import { MAX_GUESSES } from "@/games/wordle/shared";
import {
  emptyWordleStats,
  normalizeWordleStats,
  WORDLE_SLUG,
  type WordleStats,
} from "@/games/wordle/persistence";
import { loadGameData } from "@/lib/game/storage";
import { cn } from "@/lib/utils";

const LEADERBOARD_STALE_MS = 15_000;
const DEFAULT_LEADERBOARD_SKELETON_ROWS = 4;
const MAX_LEADERBOARD_ROWS = 10;
const EMPTY_DAILY_DISTRIBUTION = Array.from({ length: MAX_GUESSES }, () => 0);
const DISTRIBUTION_SKELETON_WIDTHS = [70, 62, 54, 46, 38, 30] as const;

type LeaderboardRowLabels = {
  you: string;
  won: string;
  lost: string;
};

function getWinRate(stats: WordleStats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.wins / stats.played) * 100);
}

function getInitials(name: string): string {
  const letters = name.trim().slice(0, 2);
  return letters ? letters.toUpperCase() : "WG";
}

function formatLeaderboardScore(status: "won" | "lost", guessCount: number): string {
  return status === "won" ? `${guessCount}/6` : "X/6";
}

function shouldShowPinnedCurrentUser(
  leaderboard: WordleLeaderboardResponse | null,
): boolean {
  if (!leaderboard?.currentUserEntry) return false;
  return !leaderboard.entries.some(
    (entry) => entry.userId === leaderboard.currentUserEntry?.userId,
  );
}

const SummaryStat = memo(function SummaryStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-center">
      <p className="text-xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground dark:text-foreground/58">
        {label}
      </p>
    </div>
  );
});

function getLeaderboardSkeletonRows(renderedRows: number | null | undefined): number {
  if (!renderedRows || renderedRows < 1) {
    return DEFAULT_LEADERBOARD_SKELETON_ROWS;
  }

  return Math.min(renderedRows, MAX_LEADERBOARD_ROWS + 1);
}

const LeaderboardLoadingSkeleton = memo(function LeaderboardLoadingSkeleton({
  rows,
}: {
  rows: number;
}) {
  return (
    <div
      className="h-[min(22rem,46dvh)] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading leaderboard</span>
      <div className="divide-y divide-border/70">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
            aria-hidden="true"
          >
            <div className="h-6 w-5 rounded bg-muted/60 motion-safe:animate-pulse" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-10 rounded-full bg-muted/60 motion-safe:animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-28 rounded bg-muted/60 motion-safe:animate-pulse" />
                <div className="mt-2 h-3 w-36 rounded bg-muted/50 motion-safe:animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-muted/50 motion-safe:animate-pulse" />
              <div className="h-5 w-10 rounded bg-muted/60 motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const DistributionLoadingSkeleton = memo(function DistributionLoadingSkeleton() {
  return (
    <div className="mt-4 flex flex-col gap-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading today&apos;s distribution</span>
      {Array.from({ length: MAX_GUESSES }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[20px_minmax(0,1fr)_32px] items-center gap-2 text-sm"
          aria-hidden="true"
        >
          <span className="text-right tabular-nums">{index + 1}</span>
          <div className="h-6 overflow-hidden rounded-md bg-muted/70">
            <div
              className="h-full rounded-md bg-muted/60 motion-safe:animate-pulse"
              style={{ width: `${DISTRIBUTION_SKELETON_WIDTHS[index]}%` }}
            />
          </div>
          <div className="h-4 w-6 rounded bg-muted/50 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
});

const DistributionHintSkeleton = memo(function DistributionHintSkeleton() {
  return (
    <div className="mt-2" aria-hidden="true">
      <div className="h-4 w-full max-w-md rounded bg-muted/50 motion-safe:animate-pulse" />
    </div>
  );
});

const DistributionRow = memo(function DistributionRow({
  index,
  count,
  maxDistribution,
}: {
  index: number;
  count: number;
  maxDistribution: number;
}) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_32px] items-center gap-2 text-sm">
      <span className="text-right tabular-nums">{index + 1}</span>
      <div className="h-6 overflow-hidden rounded-md bg-muted/70">
        <div
          className={cn(
            "flex h-full items-center justify-end rounded-md bg-brand px-2 text-[11px] font-medium text-brand-foreground transition-[width]",
            count === 0 && "text-transparent",
          )}
          style={{
            width: `${Math.max(
              count > 0 ? 12 : 0,
              (count / maxDistribution) * 100,
            )}%`,
          }}
        >
          {count}
        </div>
      </div>
      <span className="text-right tabular-nums text-muted-foreground">{count}</span>
    </div>
  );
});

const LeaderboardEntryRow = memo(function LeaderboardEntryRow({
  entry,
  labels,
  highlighted = false,
}: {
  entry: WordleLeaderboardEntry;
  labels: LeaderboardRowLabels;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
        highlighted && "bg-brand/8",
      )}
    >
      <span className="text-sm font-semibold tabular-nums text-muted-foreground">
        {entry.rank}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="sm">
          {entry.image ? <AvatarImage src={entry.image} alt={entry.name} /> : null}
          <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{entry.name}</p>
            {entry.isCurrentUser ? (
              <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-brand uppercase">
                {labels.you}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {entry.status === "won" ? labels.won : labels.lost}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {entry.status === "won" ? (
          <Flame className="size-4 text-wordle-correct" aria-hidden />
        ) : null}
        <span className="text-sm font-semibold tabular-nums">
          {formatLeaderboardScore(entry.status, entry.guessCount)}
        </span>
      </div>
    </div>
  );
});

export function WordleStatsModal({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const tCommon = useTranslations("Common");
  const tWordle = useTranslations("Wordle");
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<WordleStats>(emptyWordleStats());
  const [leaderboard, setLeaderboard] = useState<WordleLeaderboardResponse | null>(
    null,
  );
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [leaderboardSkeletonRows, setLeaderboardSkeletonRows] = useState(
    DEFAULT_LEADERBOARD_SKELETON_ROWS,
  );
  const leaderboardRef = useRef<WordleLeaderboardResponse | null>(null);
  const leaderboardRequestRef = useRef<Promise<void> | null>(null);
  const leaderboardLoadedAtRef = useRef(0);

  useEffect(() => {
    leaderboardRef.current = leaderboard;
  }, [leaderboard]);

  const loadLeaderboard = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (leaderboardRequestRef.current) {
      return leaderboardRequestRef.current;
    }

    const hasVisibleLeaderboard = leaderboardRef.current !== null;
    const shouldShowLoading = !silent || !hasVisibleLeaderboard;

    if (shouldShowLoading) {
      setLoadingLeaderboard(true);
    }
    setLeaderboardError(false);

    const request = (async () => {
      try {
        const response = await fetch("/api/daily-guess/leaderboard", {
          method: "GET",
          cache: isAuthenticated ? "no-store" : "default",
        });
        if (!response.ok) {
          throw new Error("leaderboard");
        }
        const data = (await response.json()) as WordleLeaderboardResponse;
        setLeaderboardSkeletonRows(
          data.entries.length + (shouldShowPinnedCurrentUser(data) ? 1 : 0),
        );
        leaderboardLoadedAtRef.current = Date.now();
        setLeaderboard(data);
      } catch {
        if (!hasVisibleLeaderboard) {
          setLeaderboardError(true);
          setLeaderboard(null);
        }
      } finally {
        if (shouldShowLoading) {
          setLoadingLeaderboard(false);
        }
        leaderboardRequestRef.current = null;
      }
    })();

    leaderboardRequestRef.current = request;
    return request;
  }, [isAuthenticated]);

  const openModal = useCallback(() => {
    setStats(
      normalizeWordleStats(
        loadGameData<WordleStats>(WORDLE_SLUG, "stats-daily", emptyWordleStats()),
      ),
    );
    const hasLeaderboard = leaderboardRef.current !== null;
    const leaderboardIsStale =
      Date.now() - leaderboardLoadedAtRef.current > LEADERBOARD_STALE_MS;

    if (!hasLeaderboard) {
      void loadLeaderboard();
    } else if (leaderboardIsStale) {
      void loadLeaderboard({ silent: true });
    }
    setOpen(true);
  }, [loadLeaderboard]);

  const handleLoginPrompt = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      openLoginModal();
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpen = () => {
      openModal();
    };

    window.addEventListener(OPEN_WORDLE_STATS_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_WORDLE_STATS_EVENT, handleOpen);
    };
  }, [openModal]);

  const winRate = useMemo(() => getWinRate(stats), [stats]);
  const guessDistribution = leaderboard?.guessDistribution ?? EMPTY_DAILY_DISTRIBUTION;
  const totalSolvedToday = useMemo(
    () => guessDistribution.reduce((sum, count) => sum + count, 0),
    [guessDistribution],
  );
  const maxDistribution = useMemo(
    () => Math.max(1, ...guessDistribution),
    [guessDistribution],
  );
  const showPinnedCurrentUser = shouldShowPinnedCurrentUser(leaderboard);
  const showDistributionLoading = loadingLeaderboard && leaderboard === null;
  const leaderboardRowLabels = useMemo<LeaderboardRowLabels>(
    () => ({
      you: tWordle("todayLeaderboardYou"),
      won: tWordle("todayLeaderboardWon"),
      lost: tWordle("todayLeaderboardLost"),
    }),
    [tWordle],
  );
  const skeletonRows = getLeaderboardSkeletonRows(
    leaderboard?.entries.length
      ? leaderboard.entries.length + (showPinnedCurrentUser ? 1 : 0)
      : leaderboardSkeletonRows,
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="size-11 rounded-full text-foreground/68 hover:text-foreground"
        aria-label={tCommon("leaderboard")}
        onClick={openModal}
      >
        <Trophy aria-hidden />
      </Button>

      <GameModalShell
        open={open}
        onClose={() => setOpen(false)}
        variant="page"
        closeButtonAriaLabel={tCommon("close")}
        titleId="wordle-stats-title"
        descriptionId="wordle-stats-description"
      >
        <div className="pr-12">
          <p className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
            {tCommon("siteName")}
          </p>
          <h2
            id="wordle-stats-title"
            className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
          >
            {tWordle("leaderboardTitle")}
          </h2>
          <p
            id="wordle-stats-description"
            className="mt-2 max-w-2xl text-sm text-muted-foreground"
          >
            {isAuthenticated
              ? tWordle("leaderboardSyncedHint")
              : tWordle("leaderboardLocalHint")}
          </p>
        </div>

        <section className="mt-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-brand" aria-hidden />
            <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
              {tWordle("leaderboardStatsTitle")}
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat value={stats.played} label={tWordle("stats.played")} />
            <SummaryStat value={winRate} label={tWordle("stats.winRate")} />
            <SummaryStat
              value={stats.currentStreak}
              label={tWordle("stats.currentStreak")}
            />
            <SummaryStat
              value={stats.maxStreak}
              label={tWordle("stats.maxStreak")}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
              {tWordle("leaderboardDistributionTitle")}
            </h3>
            <span className="rounded-full border border-brand/20 bg-brand/8 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-brand uppercase">
              {tWordle("leaderboardDistributionBadge")}
            </span>
          </div>
          {leaderboard ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {tWordle("leaderboardDistributionHint", {
                solved: totalSolvedToday,
                finished: leaderboard.totalFinished,
              })}
            </p>
          ) : showDistributionLoading ? (
            <DistributionHintSkeleton />
          ) : null}

          {showDistributionLoading ? (
            <DistributionLoadingSkeleton />
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {guessDistribution.map((count, index) => (
                <DistributionRow
                  key={index}
                  index={index}
                  count={count}
                  maxDistribution={maxDistribution}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-brand" aria-hidden />
              <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
                {tWordle("todayLeaderboardTitle")}
              </h3>
            </div>
            {leaderboard ? (
              <p className="text-xs text-muted-foreground">
                {tWordle("todayLeaderboardCount", {
                  count: leaderboard.totalFinished,
                })}
              </p>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {tWordle("todayLeaderboardRule")}
          </p>
          {!isAuthenticated ? (
            <div className="mt-4 rounded-3xl border border-brand/20 bg-brand/8 p-4">
              <p className="text-sm text-foreground">
                {tWordle("leaderboardLoginPrompt")}
              </p>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="default"
                  className="min-w-36"
                  aria-label={tCommon("login")}
                  onClick={handleLoginPrompt}
                >
                  {tWordle("leaderboardLoginCta")}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-3xl border border-border/70 bg-background/60">
            {loadingLeaderboard ? (
              <LeaderboardLoadingSkeleton rows={skeletonRows} />
            ) : leaderboardError ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                {tWordle("todayLeaderboardError")}
              </p>
            ) : leaderboard && leaderboard.entries.length > 0 ? (
              <div className="h-[min(22rem,46dvh)] overflow-y-auto overscroll-contain">
                <ol className="divide-y divide-border/70">
                  {leaderboard.entries.map((entry) => (
                    <li key={entry.userId}>
                      <LeaderboardEntryRow
                        entry={entry}
                        labels={leaderboardRowLabels}
                        highlighted={entry.isCurrentUser}
                      />
                    </li>
                  ))}
                </ol>
                {showPinnedCurrentUser && leaderboard.currentUserEntry ? (
                  <div className="sticky bottom-0 border-t border-border/70 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <p className="px-4 pt-3 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      {tWordle("todayLeaderboardMyRank")}
                    </p>
                    <LeaderboardEntryRow
                      entry={leaderboard.currentUserEntry}
                      labels={leaderboardRowLabels}
                      highlighted
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                {tWordle("todayLeaderboardEmpty")}
              </p>
            )}
          </div>
        </section>
      </GameModalShell>
    </>
  );
}
