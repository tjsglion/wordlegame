import type { GameSlug } from "@/lib/game/types";

export const publicGameSlugByInternalSlug: Record<GameSlug, string> = {
  wordle: "daily-guess",
  stackdown: "stackdown",
  strands: "theme-weave",
  wordplay: "word-trail",
  "word-search": "word-search",
  crossword: "crossword",
  "word-connect": "word-connect",
};

const publicGameSlugToInternalSlug = Object.fromEntries(
  Object.entries(publicGameSlugByInternalSlug).map(([internalSlug, publicSlug]) => [
    publicSlug,
    internalSlug as GameSlug,
  ]),
) as Record<string, GameSlug>;

export function getPublicGameSlug(slug: GameSlug | string): string {
  return publicGameSlugByInternalSlug[slug as GameSlug] ?? slug;
}

export function buildPublicGamePath(slug: GameSlug | string): string {
  return `/${getPublicGameSlug(slug)}`;
}

export function resolveGameRouteSlug(routeSlug: string): GameSlug | undefined {
  if (routeSlug in publicGameSlugToInternalSlug) {
    return publicGameSlugToInternalSlug[routeSlug];
  }
  return undefined;
}
