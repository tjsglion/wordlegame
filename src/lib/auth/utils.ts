import { cache } from "react";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";

/**
 * Cached per request, so multiple components in the same render pass only
 * hit the database once.
 */
export const getSession = cache(async () => auth());

/**
 * Redirects to the locale-prefixed /login (preserving the current path as
 * callbackUrl) when the request is not authenticated. Returns the session
 * otherwise. `callbackUrl` should be the full locale-prefixed path.
 */
export async function requireAuth(callbackUrl: string) {
  const session = await getSession();
  const user = session?.user;
  if (!session || !user) {
    const locale = await getLocale();
    redirect(`/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return { ...session, user };
}
