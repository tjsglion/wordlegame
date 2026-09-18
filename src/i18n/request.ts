import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import enMessages from "../../messages/en.json";
import { routing } from "./routing";

type Messages = typeof enMessages;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge locale messages over the English base: any key a locale is
 * missing falls back to English instead of a MISSING_MESSAGE error, so one
 * untranslated entry can never break a page.
 */
function withEnglishFallback(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      isPlainObject(value) && isPlainObject(baseValue)
        ? withEnglishFallback(baseValue, value)
        : value;
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment, but may be empty when a
  // request is rendered without a locale (e.g. during redirects).
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages: Messages =
    locale === "en"
      ? enMessages
      : (withEnglishFallback(
          enMessages,
          (await import(`../../messages/${locale}.json`)).default,
        ) as Messages);

  return { locale, messages };
});
