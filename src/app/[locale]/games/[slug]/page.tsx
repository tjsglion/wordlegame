import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getGame } from "@/games/registry";
import { GameLoader } from "@/components/game/game-loader";

export default async function GamePage({
  params,
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">{game.title[locale as Locale]}</h1>
        <p className="text-muted-foreground">{t("comingSoonDescription")}</p>
      </div>
    );
  }

  return <GameLoader slug={slug} />;
}
