import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { getSiteHost, getSiteOrigin } from "@/lib/site";

/**
 * Next.js 16 proxy (the renamed `middleware` convention).
 *
 * Combines two concerns:
 * 1. Auth: a lightweight cookie-presence check for protected paths, run on
 *    the locale-stripped pathname so `/zh/dashboard` and `/en/dashboard` are
 *    both covered. Full session verification still happens server-side in
 *    each protected page via `auth()`.
 * 2. i18n: `next-intl` middleware adds the locale prefix (`/zh`, `/en`),
 *    handling redirects/rewrites and the locale cookie.
 */
const protectedPrefixes = ["/dashboard"];

const intlMiddleware = createIntlMiddleware(routing);
const canonicalOrigin = getSiteOrigin();
const canonicalHost = getSiteHost();

/**
 * Strip the locale prefix from a pathname. Both the recognized locales and
 * the fallback locale are derived from `routing`, so adding a locale only
 * touches `src/i18n/routing.ts`.
 */
function splitLocalePrefix(pathname: string): {
  pathname: string;
  locale: string | null;
} {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (hasLocale(routing.locales, maybeLocale)) {
    return { pathname: `/${rest.join("/")}`, locale: maybeLocale };
  }
  return { pathname, locale: null };
}

function getCanonicalRedirect(request: NextRequest): URL | null {
  const requestHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;

  if (requestHost !== `www.${canonicalHost}`) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  const targetOrigin = new URL(canonicalOrigin);

  redirectUrl.protocol = targetOrigin.protocol;
  redirectUrl.host = canonicalHost;

  return redirectUrl;
}

export function proxy(request: NextRequest) {
  const canonicalRedirect = getCanonicalRedirect(request);
  if (canonicalRedirect) {
    return NextResponse.redirect(canonicalRedirect, 308);
  }

  const { pathname } = request.nextUrl;
  const { pathname: barePathname, locale } = splitLocalePrefix(pathname);

  const isProtected = protectedPrefixes.some((prefix) =>
    barePathname.startsWith(prefix),
  );

  if (isProtected) {
    const sessionToken =
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("__Secure-authjs.session-token");

    if (!sessionToken) {
      const targetLocale = locale ?? routing.defaultLocale;
      const loginUrl = new URL(`/${targetLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes, including /api/auth/*)
     * - _next (static files, image optimization, internals)
     * - files with an extension (favicon.ico, sitemap.xml, robots.txt, ...)
     */
    "/((?!api|_next|.*\\..*).*)",
  ],
};
