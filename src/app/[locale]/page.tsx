import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeToLang, type Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/utils";
import { GameLoader } from "@/components/game/game-loader";
import { getGame } from "@/games/registry";
import { SiteShell } from "@/components/layout/site-shell";
import { buildLanguageAlternates, getSiteOrigin, localizedPath } from "@/lib/site";

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
  const wordle = getGame("wordle");
  const tCommon = await getTranslations("Common");
  const tHome = await getTranslations({ locale, namespace: "HomeMetadata" });
  const fallbackTitle = tCommon("siteName");
  const pageTitle = wordle?.title[currentLocale] ?? fallbackTitle;
  const canonicalPath = localizedPath(currentLocale, "");
  const pageUrl = `${getSiteOrigin()}${canonicalPath}`;
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
      "@type": ["VideoGame", "WebApplication"],
      "@id": `${pageUrl}#game`,
      name: pageTitle,
      url: pageUrl,
      description: wordle?.description[currentLocale] ?? tHome("description"),
      inLanguage: localeToLang(currentLocale),
      applicationCategory: "Game",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern web browser.",
      genre:
        currentLocale === "zh"
          ? ["文字游戏", "益智游戏", "每日谜题"]
          : ["Word Game", "Puzzle Game", "Daily Puzzle"],
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: organization,
    },
  ];

  return (
    <SiteShell
      pageTitle={pageTitle}
      currentSlug="wordle"
      isAuthenticated={Boolean(session?.user)}
      playfield
      user={session?.user ?? null}
    >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      <GameLoader
        slug="wordle"
        isAuthenticated={Boolean(session?.user)}
      />
    </SiteShell>
  );
}
