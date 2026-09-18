import type { Locale } from "@/i18n/routing";
import { todayKey } from "@/lib/game/daily";
import {
  GOLDEN_FIXTURE,
  getStrandsLocaleCopy,
  type StrandsPuzzleData,
} from "./shared";

function cloneFixture(
  date: string,
  id: string,
  locale: Locale = "en",
): StrandsPuzzleData {
  const { puzzle } = GOLDEN_FIXTURE;
  const localeCopy = getStrandsLocaleCopy(locale);
  return {
    date,
    puzzle: {
      ...puzzle,
      id,
      words: [...puzzle.words],
      validWords: [...puzzle.validWords],
      grid: puzzle.grid.map((row) => [...row]),
      article: puzzle.article
        ? { ...puzzle.article, wordHints: puzzle.article.wordHints.map((hint) => ({ ...hint })) }
        : puzzle.article,
      themeLabel: localeCopy.themeLabel,
      spangramLabel: localeCopy.spangramLabel,
      wordLabels: { ...localeCopy.wordLabels },
    },
  };
}

export function getFixtureDailyPuzzle(
  date: Date = new Date(),
  locale: Locale = "en",
): StrandsPuzzleData {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("date must be a valid Date");
  }

  const dateKey = todayKey(date);
  return cloneFixture(dateKey, `fixture-${dateKey}`, locale);
}

export function getFixturePracticePuzzle(
  epochMillis: number,
  locale: Locale = "en",
): StrandsPuzzleData {
  if (!Number.isSafeInteger(epochMillis) || epochMillis < 0) {
    throw new RangeError("epochMillis must be a nonnegative safe integer");
  }

  const key = `practice_${epochMillis}`;
  return cloneFixture(key, key, locale);
}
