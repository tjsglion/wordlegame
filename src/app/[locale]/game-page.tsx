import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeToLang, type Locale } from "@/i18n/routing";
import { getGame } from "@/games/registry";
import { GameLoader } from "@/components/game/game-loader";
import { WordleHelpSection } from "@/components/help/wordle-help-section";
import { StackdownHelpSection } from "@/components/help/stackdown-help-section";
import { StrandsHelpSection } from "@/components/help/strands-help-section";
import { WordplayHelpSection } from "@/components/help/wordplay-help-section";
import { getSession } from "@/lib/auth/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { buildLanguageAlternates, localizedPath } from "@/lib/site";
import { getDailyStrandsPuzzle, getRandomStrandsPracticePuzzle } from "@/games/strands/server";
import { todayKey, utcDateKeyToEpochMillis } from "@/lib/game/daily";

interface GameRouteParams {
  locale: string;
  slug: string;
}

export async function generateGameMetadata({
  locale,
  slug,
}: GameRouteParams): Promise<Metadata> {
  const currentLocale = locale as Locale;
  const game = getGame(slug);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  if (!game) {
    return {
      title: t("title"),
      description: t("description"),
    };
  }

  const canonicalPath = localizedPath(currentLocale, `/${slug}`);
  const isWordle = slug === "wordle";
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tWordle = isWordle
    ? await getTranslations({ locale, namespace: "WordleMetadata" })
    : null;
  const pageTitle = isWordle
    ? tWordle!("title")
    : `${game.title[currentLocale]} | ${tCommon("siteName")}`;
  const pageDescription = isWordle
    ? tWordle!("description")
    : game.description[currentLocale];
  const keywords = isWordle ? (tWordle!.raw("keywords") as string[]) : undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(`/${slug}`),
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalPath,
      type: "website",
      siteName: tCommon("siteName"),
      locale: localeToLang(currentLocale),
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export async function GameRoutePage({
  locale,
  slug,
  mode = "daily",
  practicePuzzleId,
}: GameRouteParams & { mode?: "daily" | "practice"; practicePuzzleId?: string }) {
  // The layout already rejects unknown locales via hasLocale.
  setRequestLocale(locale);
  const session = await getSession();

  const game = getGame(slug);
  if (!game) {
    notFound();
  }

  // Unregistered in game-loader but listed as available should never happen;
  // coming-soon games get a placeholder page.
  if (game.status !== "available") {
    const t = await getTranslations("GamePage");
    return (
      <SiteShell
        pageTitle={game.title[locale as Locale]}
        currentSlug={game.slug}
        isAuthenticated={Boolean(session?.user)}
        user={session?.user ?? null}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">{game.title[locale as Locale]}</h1>
          <p className="text-muted-foreground">{t("comingSoonDescription")}</p>
        </div>
      </SiteShell>
    );
  }

  const strandsPuzzle = slug === "strands"
    ? mode === "practice"
      ? await getRandomStrandsPracticePuzzle(utcDateKeyToEpochMillis(todayKey()), practicePuzzleId)
      : await getDailyStrandsPuzzle(todayKey())
    : null;

  return (
    <SiteShell
      pageTitle={game.title[locale as Locale]}
      currentSlug={game.slug}
      isAuthenticated={Boolean(session?.user)}
      playfield={slug === "wordle" || slug === "stackdown" || slug === "strands" || slug === "wordplay"}
      user={session?.user ?? null}
    >
      <GameLoader
        slug={slug}
        isAuthenticated={Boolean(session?.user)}
        strandsPuzzle={strandsPuzzle}
      />
      {slug === "wordle" ? <WordleHelpSection /> : null}
      {slug === "stackdown" ? <StackdownHelpSection /> : null}
      {slug === "strands" ? <StrandsHelpSection /> : null}
      {slug === "wordplay" ? <WordplayHelpSection /> : null}
    </SiteShell>
  );
}
