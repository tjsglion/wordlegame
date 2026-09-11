"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, Star, Trophy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { openLoginModal } from "@/components/auth/login-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useOverlayBehavior } from "@/components/ui/use-overlay-behavior";
import {
  OPEN_STACKDOWN_STATS_EVENT,
  type StackdownLeaderboardEntry,
  type StackdownLeaderboardResponse,
} from "@/games/stackdown/leaderboard";
import {
  emptyStackdownStats,
  STAR_COUNT,
  type StackdownStats,
} from "@/games/stackdown/persistence";
import { formatTime, loadStackdownStats } from "@/games/stackdown/use-stackdown";
import { cn } from "@/lib/utils";

const LEADERBOARD_STALE_MS = 15_000;
const DEFAULT_LEADERBOARD_SKELETON_ROWS = 4;
const MAX_LEADERBOARD_ROWS = 10;
const EMPTY_STAR_DISTRIBUTION = Array.from({ length: STAR_COUNT }, () => 0);
const DISTRIBUTION_SKELETON_WIDTHS = [78, 66, 54, 42, 30, 18] as const;

function getInitials(name: string): string {
  const letters = name.trim().slice(0, 2);
  return letters ? letters.toUpperCase() : "WG";
}

function shouldShowPinnedCurrentUser(
  leaderboard: StackdownLeaderboardResponse | null,
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
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-center">
      <p className="text-xl font-semibold tracking-[-0.03em] tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
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
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[28px_minmax(0,1fr)_32px] items-center gap-2 text-sm"
          aria-hidden="true"
        >
          <span className="text-right tabular-nums">★{index + 1}</span>
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
  stars,
  count,
  maxDistribution,
}: {
  stars: number;
  count: number;
  maxDistribution: number;
}) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_32px] items-center gap-2 text-sm">
      <span className="text-right tabular-nums">★{stars}</span>
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
  youLabel,
  highlighted = false,
}: {
  entry: StackdownLeaderboardEntry;
  youLabel: string;
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
                {youLabel}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatTime(entry.timeMs)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Star
          className="size-4 fill-[#d48d00] text-[#d48d00]"
          aria-hidden
        />
        <span className="text-sm font-semibold tabular-nums">{entry.stars}</span>
      </div>
    </div>
  );
});

export function StackdownStatsModal({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const tCommon = useTranslations("Common");
  const tStackdown = useTranslations("Stackdown");
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<StackdownStats>(emptyStackdownStats());
  const [leaderboard, setLeaderboard] = useState<StackdownLeaderboardResponse | null>(
    null,
  );
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [leaderboardSkeletonRows, setLeaderboardSkeletonRows] = useState(
    DEFAULT_LEADERBOARD_SKELETON_ROWS,
  );
  const portalRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<StackdownLeaderboardResponse | null>(null);
  const leaderboardRequestRef = useRef<Promise<void> | null>(null);
  const leaderboardLoadedAtRef = useRef(0);

  useOverlayBehavior({
    open,
    portalRef,
    onClose: () => setOpen(false),
  });

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
        const response = await fetch("/api/stackdown/leaderboard", {
          method: "GET",
          cache: isAuthenticated ? "no-store" : "default",
        });
        if (!response.ok) {
          throw new Error("leaderboard");
        }
        const data = (await response.json()) as StackdownLeaderboardResponse;
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
    // The modal always shows the daily stats, regardless of the mode played.
    setStats(loadStackdownStats("daily"));
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

    window.addEventListener(OPEN_STACKDOWN_STATS_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_STACKDOWN_STATS_EVENT, handleOpen);
    };
  }, [openModal]);

  const starDistribution = leaderboard?.starDistribution ?? EMPTY_STAR_DISTRIBUTION;
  const maxDistribution = useMemo(
    () => Math.max(1, ...starDistribution),
    [starDistribution],
  );
  const showPinnedCurrentUser = shouldShowPinnedCurrentUser(leaderboard);
  const showDistributionLoading = loadingLeaderboard && leaderboard === null;
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
        className="size-11 rounded-full text-muted-foreground hover:text-foreground"
        aria-label={tCommon("leaderboard")}
        onClick={openModal}
      >
        <Trophy aria-hidden />
      </Button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={portalRef}
              className="fixed inset-0 z-[60]"
              aria-modal="true"
              role="dialog"
              aria-labelledby="stackdown-stats-title"
              aria-describedby="stackdown-stats-description"
              tabIndex={-1}
            >
              <button
                type="button"
                aria-label={tCommon("close")}
                className="absolute inset-0 touch-none bg-black/28 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />

              <div className="pointer-events-none absolute inset-0 flex justify-center">
                <div className="pointer-events-auto relative h-dvh w-full max-w-4xl overflow-hidden bg-card shadow-2xl sm:border-x sm:border-border/80">
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label={tCommon("close")}
                    data-overlay-close
                    data-overlay-initial-focus
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden />
                  </Button>

                  <div className="h-dvh overflow-y-auto px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
                    <div className="pr-12">
                      <p className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
                        {tCommon("siteName")}
                      </p>
                      <h2
                        id="stackdown-stats-title"
                        className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
                      >
                        {tStackdown("leaderboardTitle")}
                      </h2>
                      <p
                        id="stackdown-stats-description"
                        className="mt-2 max-w-2xl text-sm text-muted-foreground"
                      >
                        {isAuthenticated
                          ? tStackdown("leaderboardSyncedHint")
                          : tStackdown("leaderboardLocalHint")}
                      </p>
                    </div>

                    <section className="mt-8">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-4 text-brand" aria-hidden />
                        <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
                          {tStackdown("leaderboardStatsTitle")}
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <SummaryStat value={stats.wins} label={tStackdown("stats.wins")} />
                        <SummaryStat
                          value={stats.currentStreak}
                          label={tStackdown("stats.currentStreak")}
                        />
                        <SummaryStat
                          value={stats.maxStreak}
                          label={tStackdown("stats.maxStreak")}
                        />
                        <SummaryStat
                          value={
                            stats.bestTimeMs === null
                              ? "—"
                              : formatTime(stats.bestTimeMs)
                          }
                          label={tStackdown("stats.bestTime")}
                        />
                      </div>
                    </section>

                    <section className="mt-8">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
                          {tStackdown("leaderboardDistributionTitle")}
                        </h3>
                        <span className="rounded-full border border-brand/20 bg-brand/8 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-brand uppercase">
                          {tStackdown("leaderboardDistributionBadge")}
                        </span>
                      </div>
                      {leaderboard ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {tStackdown("leaderboardDistributionHint", {
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
                          {starDistribution.map((count, index) => (
                            <DistributionRow
                              key={index}
                              stars={index + 1}
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
                            {tStackdown("todayLeaderboardTitle")}
                          </h3>
                        </div>
                        {leaderboard ? (
                          <p className="text-xs text-muted-foreground">
                            {tStackdown("todayLeaderboardCount", {
                              count: leaderboard.totalFinished,
                            })}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tStackdown("todayLeaderboardRule")}
                      </p>
                      {!isAuthenticated ? (
                        <div className="mt-4 rounded-3xl border border-brand/20 bg-brand/8 p-4">
                          <p className="text-sm text-foreground">
                            {tStackdown("leaderboardLoginPrompt")}
                          </p>
                          <div className="mt-3">
                              <Button
                                type="button"
                                variant="default"
                                className="min-w-36"
                                aria-label={tCommon("login")}
                                onClick={handleLoginPrompt}
                              >
                                {tStackdown("leaderboardLoginCta")}
                              </Button>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 overflow-hidden rounded-3xl border border-border/70 bg-background/60">
                        {loadingLeaderboard ? (
                          <LeaderboardLoadingSkeleton rows={skeletonRows} />
                        ) : leaderboardError ? (
                          <p className="px-4 py-6 text-sm text-muted-foreground">
                            {tStackdown("todayLeaderboardError")}
                          </p>
                        ) : leaderboard && leaderboard.entries.length > 0 ? (
                          <div className="h-[min(22rem,46dvh)] overflow-y-auto overscroll-contain">
                            <ol className="divide-y divide-border/70">
                              {leaderboard.entries.map((entry) => (
                                <li key={entry.userId}>
                                  <LeaderboardEntryRow
                                    entry={entry}
                                    youLabel={tStackdown("todayLeaderboardYou")}
                                    highlighted={entry.isCurrentUser}
                                  />
                                </li>
                              ))}
                            </ol>
                            {showPinnedCurrentUser && leaderboard.currentUserEntry ? (
                              <div className="sticky bottom-0 border-t border-border/70 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80">
                                <p className="px-4 pt-3 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                  {tStackdown("todayLeaderboardMyRank")}
                                </p>
                                <LeaderboardEntryRow
                                  entry={leaderboard.currentUserEntry}
                                  youLabel={tStackdown("todayLeaderboardYou")}
                                  highlighted
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="px-4 py-6 text-sm text-muted-foreground">
                            {tStackdown("todayLeaderboardEmpty")}
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
