import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeToLang } from "@/i18n/routing";
import { BRAND_COLORS } from "@/lib/brand";
import { getSiteOrigin } from "@/lib/site";
import { LangSync } from "@/components/lang-sync";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // themeColor lives in the viewport export (deprecated in metadata).
  // Colors come from the shared brand palette (mirrors --background in
  // globals.css, light and .dark variants).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLORS.background },
    { media: "(prefers-color-scheme: dark)", color: BRAND_COLORS.backgroundDark },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL(getSiteOrigin()),
    title: t("title"),
    description: t("description"),
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "LetterLoop",
    },
  };
}

/**
 * Nested locale layout: html/body (and the pre-hydration color-scheme
 * script) live in the true root layout src/app/layout.tsx, which never
 * re-renders on locale switches. This layout only re-wraps providers.
 */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <LangSync lang={localeToLang(locale)} />
      {children}
    </NextIntlClientProvider>
  );
}
