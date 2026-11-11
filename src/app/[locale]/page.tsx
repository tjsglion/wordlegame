import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeToLang, type Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/utils";
import { games } from "@/games/registry";
import { SiteShell } from "@/components/layout/site-shell";
import { buildLanguageAlternates, getSiteOrigin, localizedPath } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { buildPublicGamePath } from "@/lib/game/public-slugs";

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomeMetadata" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const currentLocale = locale as Locale;
  const canonicalPath = localizedPath(currentLocale, "");
  const title = t("title");
  const description = t("description");
  const keywords = t.raw("keywords") as string[];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(""),
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
      siteName: tCommon("siteName"),
      locale: localeToLang(currentLocale),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  // The layout already rejects unknown locales via hasLocale.
  const { locale } = await params;
  setRequestLocale(locale);

  const currentLocale = locale as Locale;
  const session = await getSession();
  const tCommon = await getTranslations("Common");
  const tHome = await getTranslations({ locale, namespace: "HomeMetadata" });
  const tLobby = await getTranslations({ locale, namespace: "HomePage" });
  const fallbackTitle = tCommon("siteName");
  const canonicalPath = localizedPath(currentLocale, "");
  const pageUrl = `${getSiteOrigin()}${canonicalPath}`;
  const availableGames = games.filter((game) => game.status === "available");
  const upcomingGames = games.filter((game) => game.status !== "available");
  const organization = {
    "@type": "Organization",
    name: fallbackTitle,
    url: getSiteOrigin(),
  };
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${pageUrl}#website`,
      name: fallbackTitle,
      url: pageUrl,
      description: tHome("description"),
      inLanguage: localeToLang(currentLocale),
      publisher: organization,
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collection`,
      name: fallbackTitle,
      url: pageUrl,
      description: tHome("description"),
      inLanguage: localeToLang(currentLocale),
      publisher: organization,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${pageUrl}#games`,
      itemListElement: availableGames.map((game, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: game.title[currentLocale],
        url: `${getSiteOrigin()}${localizedPath(currentLocale, buildPublicGamePath(game.slug))}`,
      })),
    },
  ];

  return (
    <SiteShell
      pageTitle={fallbackTitle}
      isAuthenticated={Boolean(session?.user)}
      user={session?.user ?? null}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/80 px-6 py-7 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.45)] sm:px-8 sm:py-9">
          <p className="text-[11px] font-medium tracking-[0.24em] text-foreground/58 uppercase">
            {tLobby("eyebrow")}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                {tLobby("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {tLobby("description")}
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm text-muted-foreground">
              {tLobby("instantPlay")}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
              {tLobby("availableTitle")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {availableGames.map((game) => {
              const publicPath = buildPublicGamePath(game.slug);
              const isDailyGuess = game.slug === "wordle";

              return (
                <article
                  key={game.slug}
                  className="rounded-[1.75rem] border border-border/70 bg-card/75 p-5 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.2em] text-brand uppercase">
                        {tCommon("availableNow")}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                        {game.title[currentLocale]}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {game.description[currentLocale]}
                  </p>

                  {isDailyGuess ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {tCommon("practiceModeDescription")}
                      </p>
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <Link
                          href={publicPath}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground transition hover:opacity-95"
                        >
                          {tLobby("playDailyGuess")}
                        </Link>
                        <Link
                          href={{
                            pathname: publicPath,
                            query: { mode: "practice" },
                          }}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-background/75 px-4 text-sm font-medium text-foreground transition hover:bg-background"
                        >
                          {tLobby("practiceDailyGuess")}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="mt-5">
                      <Link
                        href={publicPath}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-background/75 px-4 text-sm font-medium text-foreground transition hover:bg-background"
                      >
                        {tLobby("openGame", { game: game.title[currentLocale] })}
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
            {tLobby("comingSoonTitle")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {upcomingGames.map((game) => (
              <div
                key={game.slug}
                className="rounded-[1.5rem] border border-border/65 bg-card/60 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-foreground">
                    {game.title[currentLocale]}
                  </h3>
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-secondary px-3 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase whitespace-nowrap">
                    {tCommon("comingSoon")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {game.description[currentLocale]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
