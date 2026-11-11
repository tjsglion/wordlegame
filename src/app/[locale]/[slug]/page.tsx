import type { Metadata } from "next";
import { GameRoutePage, generateGameMetadata } from "@/app/[locale]/game-page";
import { resolveGameRouteSlug } from "@/lib/game/public-slugs";

interface GamePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedSlug = resolveGameRouteSlug(slug);
  return generateGameMetadata({ locale, slug: resolvedSlug ?? slug });
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { locale, slug } = await params;
  const resolvedSlug = resolveGameRouteSlug(slug);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  return GameRoutePage({
    locale,
    slug: resolvedSlug ?? slug,
    mode: resolvedSearchParams.mode === "practice" ? "practice" : "daily",
    practicePuzzleId: resolvedSearchParams.mode === "practice" && typeof resolvedSearchParams.puzzle === "string"
      ? resolvedSearchParams.puzzle
      : undefined,
  });
}
