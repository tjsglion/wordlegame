import type { GameStatus } from "./shared";

export const OPEN_WORDLE_STATS_EVENT = "wordle:open-stats";

export interface WordleLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  status: Extract<GameStatus, "won" | "lost">;
  guessCount: number;
  updatedAt: number;
  isCurrentUser: boolean;
}

export interface WordleLeaderboardResponse {
  dateKey: string;
  totalFinished: number;
  guessDistribution: number[];
  entries: WordleLeaderboardEntry[];
  currentUserEntry: WordleLeaderboardEntry | null;
}

export function isFinishedWordleStatus(
  status: GameStatus,
): status is Extract<GameStatus, "won" | "lost"> {
  return status === "won" || status === "lost";
}

export function openWordleStatsModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_WORDLE_STATS_EVENT));
}
