import { notFound, permanentRedirect } from "next/navigation";
import {
  buildPublicGamePath,
  resolveGameRouteSlug,
} from "@/lib/game/public-slugs";

export default async function GamePage({
  params,
  searchParams,
}: PageProps<"/[locale]/games/[slug]">) {
  const { locale, slug } = await params;
  const internalSlug = resolveGameRouteSlug(slug);
  if (!internalSlug) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const redirectUrl = new URL(`/${locale}${buildPublicGamePath(internalSlug)}`, "http://localhost");
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
