import { routing, type Locale } from "@/i18n/routing";

const LOCAL_DEV_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSiteOrigin(): string {
  const configuredOrigin = process.env.APP_ORIGIN?.trim();
  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }
  return LOCAL_DEV_ORIGIN;
}

export function getSiteHost(): string {
  return new URL(getSiteOrigin()).host;
}

export function localizedPath(locale: Locale, pathname = ""): string {
  const normalizedPath = pathname ? (pathname.startsWith("/") ? pathname : `/${pathname}`) : "";
  return `/${locale}${normalizedPath}`;
}

export function buildLanguageAlternates(pathname = ""): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedPath(locale, pathname)]),
    ),
    "x-default": localizedPath(routing.defaultLocale, pathname),
  };
}
