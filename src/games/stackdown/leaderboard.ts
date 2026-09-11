export const OPEN_STACKDOWN_STATS_EVENT = "stackdown:open-stats";

export interface StackdownLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  /** 1..6 stars: 6 minus total hints, floor of 1. */
  stars: number;
  timeMs: number;
  updatedAt: number;
  isCurrentUser: boolean;
}

export interface StackdownLeaderboardResponse {
  dateKey: string;
  totalFinished: number;
  /** Finished games per star count, index 0 = 1 star ... index 5 = 6 stars. */
  starDistribution: number[];
  entries: StackdownLeaderboardEntry[];
  currentUserEntry: StackdownLeaderboardEntry | null;
}

/**
 * Ranking order: more stars first, then faster time, then earlier finish.
 * Pure so it can be unit-tested without a database (see
 * scripts/test-stackdown-sync.ts).
 */
export function rankStackdownEntries<
  T extends { userId: string; stars: number; timeMs: number; updatedAt: number },
>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    if (left.stars !== right.stars) return right.stars - left.stars;
    if (left.timeMs !== right.timeMs) return left.timeMs - right.timeMs;
    if (left.updatedAt !== right.updatedAt) return left.updatedAt - right.updatedAt;
    return left.userId.localeCompare(right.userId);
  });
}

export function openStackdownStatsModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_STACKDOWN_STATS_EVENT));
}
