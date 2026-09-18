import type { ReactNode } from "react";
import type { GameSlug } from "@/lib/game/types";
import { SiteHeader } from "@/components/layout/site-header";

interface SiteShellProps {
  children: ReactNode;
  pageTitle: string;
  currentSlug?: GameSlug;
  isAuthenticated: boolean;
  /** Game pages: paint the focused playfield background server-side (see
   * .game-shell--playfield in globals.css) instead of the plain shell, which
   * avoids a hydration flash while client-side games mount. */
  playfield?: boolean;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function SiteShell({
  children,
  pageTitle,
  currentSlug,
  isAuthenticated,
  playfield = false,
  user,
}: SiteShellProps) {
  return (
    <div
      className={`game-shell flex min-h-dvh flex-1 flex-col ${
        playfield ? "game-shell--playfield" : "bg-background"
      } ${currentSlug === "stackdown" ? "game-shell--stackdown" : ""} ${
        currentSlug === "wordle" ? "game-shell--wordle" : ""
      } ${currentSlug === "strands" ? "game-shell--strands" : ""}`}
    >
      <SiteHeader
        pageTitle={pageTitle}
        currentSlug={currentSlug}
        isAuthenticated={isAuthenticated}
        user={user}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
