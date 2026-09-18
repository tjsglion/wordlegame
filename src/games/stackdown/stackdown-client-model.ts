import type { StackdownTile } from "./shared";
import { type StackdownDailyState, type StackdownStats } from "./persistence";
import { MAX_HINTS_PER_WORD, stackdownStars, WORD_LENGTH, type GameMode } from "./shared";

export interface BoardTile extends StackdownTile {
  id: number;
}

export interface SlotTile {
  tileId: number;
  letter: string;
}

export interface PendingReturn {
  slots: SlotTile[];
  presentIds: number[];
  fromIndex: number;
}

export interface PersistedDaily {
  dateKey: string;
  tiles: StackdownTile[];
  presentIds: number[];
  slots: SlotTile[];
  solved: string[];
  solvedPicks?: number[][];
  hintsUsed: number;
  wordHints?: number[];
  clue: string | null;
  elapsedMs: number;
  solveMarksMs: number[];
  status: "playing" | "won";
  updatedAt?: number;
}

export function persistedBoardState(
  pendingReturn: PendingReturn | null,
  slots: SlotTile[],
  presentIds: number[],
): Pick<PersistedDaily, "slots" | "presentIds"> {
  if (!pendingReturn) return { slots, presentIds };
  const returnedTileIds = pendingReturn.slots
    .slice(pendingReturn.fromIndex)
    .map((slot) => slot.tileId);
  return {
    slots: pendingReturn.slots.slice(0, pendingReturn.fromIndex),
    presentIds: [...pendingReturn.presentIds, ...returnedTileIds],
  };
}

export type PersistedDailySnapshotInput = Omit<
  PersistedDaily,
  "presentIds" | "slots" | "updatedAt"
> & {
  presentIds: number[];
  slots: SlotTile[];
  dailyUpdatedAt: number;
};

/** Converts runtime field names into the stable local-storage payload. */
export function createPersistedDailySnapshot(
  input: PersistedDailySnapshotInput,
  pendingReturn: PendingReturn | null,
): PersistedDaily {
  const { dailyUpdatedAt, ...daily } = input;
  return {
    ...daily,
    ...persistedBoardState(pendingReturn, input.slots, input.presentIds),
    updatedAt: dailyUpdatedAt,
  };
}

export function previousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function reconstructProgress(saved: PersistedDaily): { picks: number[][]; wordHints: number[] } {
  const pool = saved.tiles.map((_, id) => id).filter(
    (id) => !saved.presentIds.includes(id) && !saved.slots.some((slot) => slot.tileId === id),
  );
  const picks: number[][] = [];
  for (const word of saved.solved) {
    const row: number[] = [];
    for (const letter of word) {
      const id = pool.find((candidate) => !row.includes(candidate) && saved.tiles[candidate]?.letter === letter);
      if (id === undefined) break;
      row.push(id);
    }
    if (row.length !== WORD_LENGTH) break;
    picks.push(row);
  }
  let hintsLeft = saved.hintsUsed;
  const wordHints = saved.solved.map(() => {
    const hints = Math.min(hintsLeft, MAX_HINTS_PER_WORD);
    hintsLeft -= hints;
    return hints;
  });
  return { picks, wordHints };
}

export function sameStatsContent(left: StackdownStats, right: StackdownStats): boolean {
  return left.wins === right.wins && left.currentStreak === right.currentStreak && left.maxStreak === right.maxStreak && left.bestTimeMs === right.bestTimeMs && left.distribution.every((count, index) => count === right.distribution[index]);
}

/** Applies a completed round to per-mode stats without owning UI state. */
export function recordStackdownWin(
  previous: StackdownStats,
  {
    mode,
    dateKey,
    hintsUsed,
    solveMark,
    updatedAt,
  }: {
    mode: GameMode;
    dateKey: string | null;
    hintsUsed: number;
    solveMark: number;
    updatedAt: number;
  },
): StackdownStats {
  const currentStreak = mode === "daily"
    ? previous.lastDailyWin === previousDateKey(dateKey ?? "")
      ? previous.currentStreak + 1
      : 1
    : previous.currentStreak + 1;
  const stars = stackdownStars(hintsUsed);
  return {
    wins: previous.wins + 1,
    currentStreak,
    maxStreak: Math.max(previous.maxStreak, currentStreak),
    bestTimeMs: previous.bestTimeMs === null
      ? solveMark
      : Math.min(previous.bestTimeMs, solveMark),
    lastDailyWin: mode === "daily" ? dateKey ?? "" : previous.lastDailyWin,
    distribution: previous.distribution.map((count, index) =>
      index === stars - 1 ? count + 1 : count,
    ),
    updatedAt,
  };
}

export function dailyProjection(
  state: Pick<
    StackdownDailyState,
    "dateKey" | "picks" | "status" | "wordTimes" | "updatedAt"
  > | null,
): string | null {
  if (!state) return null;
  return JSON.stringify({
    d: state.dateKey,
    p: state.picks,
    s: state.status,
    h: state.wordTimes.map((word) => word.hints),
    u: state.updatedAt,
  });
}
