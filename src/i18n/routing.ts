import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All supported locales. `en` is the default and always carries its prefix
  // (`/zh/...`, `/en/...`) so every URL unambiguously identifies its locale.
  locales: ["zh", "en"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/**
 * Single source of truth for locale → <html lang> mapping. Used by the
 * nested [locale] layout (LangSync) and by the root layout's inline script
 * (which stringifies this mapping — never hardcode lang values there).
 */
export function localeToLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : locale;
}
