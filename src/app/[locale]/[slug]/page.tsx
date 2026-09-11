import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
import { GameRoutePage, generateGameMetadata } from "@/app/[locale]/game-page";
import { localeToLang, type Locale } from "@/i18n/routing";
import { buildLanguageAlternates, localizedPath } from "@/lib/site";

interface GamePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug === "wordle") {
    const currentLocale = locale as Locale;
    const t = await getTranslations({ locale, namespace: "HomeMetadata" });
    const tCommon = await getTranslations({ locale, namespace: "Common" });
    const canonicalPath = localizedPath(currentLocale, "");
    return {
      title: t("title"),
      description: t("description"),
      keywords: t.raw("keywords") as string[],
      alternates: {
        canonical: canonicalPath,
        languages: buildLanguageAlternates(""),
      },
      openGraph: {
        title: t("title"),
        description: t("description"),
        url: canonicalPath,
        type: "website",
        siteName: tCommon("siteName"),
        locale: localeToLang(currentLocale),
      },
      twitter: {
        card: "summary",
        title: t("title"),
        description: t("description"),
      },
    };
  }
  return generateGameMetadata({ locale, slug });
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { locale, slug } = await params;
  if (slug === "wordle") {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const redirectUrl = new URL(
      localizedPath(locale as Locale, ""),
      "http://localhost",
    );

    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (typeof value === "string") {
        redirectUrl.searchParams.set(key, value);
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          redirectUrl.searchParams.append(key, item);
        }
      }
    }

    permanentRedirect(`${redirectUrl.pathname}${redirectUrl.search}`);
  }
  return GameRoutePage({ locale, slug });
}
