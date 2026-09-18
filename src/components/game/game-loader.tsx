"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { gameLoaders } from "@/games/registry";
import { StrandsGameSkeleton } from "@/games/strands/strands-skeleton";
import type { StrandsPuzzleData } from "@/games/strands/shared";

/**
 * Client-side game loader. Games are code-split per slug and rendered only on
 * the client (`ssr: false`), since game UIs depend on localStorage, window
 * size, and other browser APIs.
 *
 * The loaders themselves are declared in the registry
 * (src/games/registry.ts) — this map only wraps them in `next/dynamic`.
 */
const gameComponents: Record<string, ComponentType<Record<string, unknown>>> =
  Object.fromEntries(
  Object.entries(gameLoaders).map(([slug, load]) => [
    slug,
    dynamic(load, {
      ssr: false,
      ...(slug === "strands" ? { loading: StrandsGameSkeleton } : {}),
    }),
  ]),
);

export function GameLoader({
  slug,
  isAuthenticated = false,
  strandsPuzzle,
}: {
  slug: string;
  isAuthenticated?: boolean;
  strandsPuzzle?: StrandsPuzzleData | null;
}) {
  const Game = gameComponents[slug];
  if (!Game) return null;
  return <Game isAuthenticated={isAuthenticated} strandsPuzzle={strandsPuzzle} />;
}
