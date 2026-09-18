import Script from "next/script";
import { localeToLang, routing } from "@/i18n/routing";
import { GOOGLE_ADSENSE_CLIENT_ID, GOOGLE_ADSENSE_ENABLED } from "@/lib/ads";
import "./globals.css";

/**
 * Follows the system color scheme: toggles the `dark` class on
 * <html> (matches the `.dark` theme block and the `@custom-variant dark`
 * selector in globals.css) and keeps it in sync when the OS setting flips.
 * Also seeds <html lang> from the URL locale prefix before hydration.
 * Runs synchronously during HTML parsing to avoid a light-theme flash (FOUC).
 * No toggle UI — zero chrome by design.
 *
 * The lang mapping is generated from localeToLang(routing) — the single
 * source of truth — so adding a locale never leaves this script behind.
 */
const LANG_BY_LOCALE = Object.fromEntries(
  routing.locales.map((locale) => [locale, localeToLang(locale)]),
);
const DEFAULT_LANG = localeToLang(routing.defaultLocale);
const COLOR_SCHEME_SCRIPT = `(function(){var m=window.matchMedia("(prefers-color-scheme: dark)");var apply=function(){document.documentElement.classList.toggle("dark",m.matches)};apply();m.addEventListener("change",apply);var seg=location.pathname.split("/")[1];document.documentElement.lang=(${JSON.stringify(LANG_BY_LOCALE)})[seg]||${JSON.stringify(DEFAULT_LANG)}})();`;

/**
 * True root layout (no dynamic segment): it never re-renders on client-side
 * locale switches, so the raw <script> below is only ever server-rendered —
 * React refuses to execute component-rendered scripts on the client.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={DEFAULT_LANG} className="h-full antialiased" suppressHydrationWarning>
      <head>
        {GOOGLE_ADSENSE_ENABLED ? (
          <meta name="google-adsense-account" content={GOOGLE_ADSENSE_CLIENT_ID} />
        ) : null}
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        {/* Inline color-scheme script: mutates <html> before first paint.
            suppressHydrationWarning above covers the class/lang it sets. */}
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
        {GOOGLE_ADSENSE_ENABLED ? (
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
