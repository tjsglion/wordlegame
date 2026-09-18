"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { GameMode } from "./use-stackdown";
import { StackdownRound } from "./stackdown-round";

function resolveMode(searchParams: ReturnType<typeof useSearchParams>): GameMode {
  return searchParams.get("mode") === "practice" ? "practice" : "daily";
}

function buildModeHref(pathname: string, mode: GameMode): string {
  return mode === "practice" ? `${pathname}?mode=practice` : pathname;
}

/** Routes a Stackdown round; all gameplay presentation lives in `StackdownRound`. */
export default function StackdownGame({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const mode = resolveMode(searchParams);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const { body } = document;
    const previous = body.style.overscrollBehavior;
    body.style.overscrollBehavior = "none";
    return () => { body.style.overscrollBehavior = previous; };
  }, []);

  const navigateToMode = useCallback((nextMode: GameMode) => {
    router.replace(buildModeHref(pathname, nextMode), { scroll: false });
  }, [pathname, router]);

  return <StackdownRound key={`${mode}:${round}`} mode={mode} isAuthenticated={isAuthenticated} onNewRound={() => setRound((value) => value + 1)} onPlayPractice={() => navigateToMode("practice")} onBackToDaily={() => navigateToMode("daily")} />;
}
