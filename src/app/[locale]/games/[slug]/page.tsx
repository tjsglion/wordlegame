import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getGame } from "@/games/registry";
import { GameLoader } from "@/components/game/game-loader";
import { getDailyStrandsPuzzle, getRandomStrandsPracticePuzzle } from "@/games/strands/server";
import { todayKey, utcDateKeyToEpochMillis } from "@/lib/game/daily";

export default async function GamePage({
  params,
  searchParams,
}: PageProps<"/[locale]/games/[slug]">) {
  // The layout already rejects unknown locales via hasLocale.
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getGame(slug);
  if (!game) {
    notFound();
  }

  // Unregistered in game-loader but listed as available should never happen;
  // coming-soon games get a placeholder page.
  if (game.status !== "available") {
    const t = await getTranslations("GamePage");
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">{game.title[locale as Locale]}</h1>
          <p className="text-muted-foreground">{t("comingSoonDescription")}</p>
        </div>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const practicePuzzleId = resolvedSearchParams.mode === "practice" && typeof resolvedSearchParams.puzzle === "string"
    ? resolvedSearchParams.puzzle
    : undefined;
  const strandsPuzzle = slug === "strands"
    ? resolvedSearchParams.mode === "practice"
      ? await getRandomStrandsPracticePuzzle(utcDateKeyToEpochMillis(todayKey()), practicePuzzleId)
      : await getDailyStrandsPuzzle(todayKey())
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <GameLoader slug={slug} strandsPuzzle={strandsPuzzle} />
    </div>
  );
}
