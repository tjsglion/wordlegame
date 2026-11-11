import type { MetadataRoute } from "next";
import { games } from "@/games/registry";
import { routing } from "@/i18n/routing";
import { buildPublicGamePath } from "@/lib/game/public-slugs";
import { getSiteOrigin, localizedPath } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const lastModified = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    urls.push({
      url: `${origin}${localizedPath(locale)}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    });

    for (const game of games.filter((item) => item.status === "available")) {
      urls.push({
        url: `${origin}${localizedPath(locale, buildPublicGamePath(game.slug))}`,
        lastModified,
        changeFrequency: game.slug === "wordle" || game.slug === "strands" ? "daily" : "weekly",
        priority: game.slug === "wordle" ? 0.9 : 0.8,
      });
    }
  }

  return urls;
}
