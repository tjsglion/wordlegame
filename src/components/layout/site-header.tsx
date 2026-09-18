"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { games } from "@/games/registry";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { GameSlug } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { LoginModal } from "@/components/auth/login-dialog";
import { HelpModal } from "@/components/help/help-modal";
import { UserProfileTrigger } from "@/components/layout/user-profile-trigger";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SoundToggle } from "@/components/sound-toggle";
import { Button } from "@/components/ui/button";
import { WordleStatsModal } from "@/components/wordle/wordle-stats-modal";
import { StackdownStatsModal } from "@/components/stackdown/stackdown-stats-modal";
import { requestStrandsResults } from "@/games/strands/results";

interface SiteHeaderProps {
  pageTitle: string;
  currentSlug?: GameSlug;
  isAuthenticated: boolean;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function SiteHeader({
  pageTitle,
  currentSlug,
  isAuthenticated,
  user,
}: SiteHeaderProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Common");
  const tStrands = useTranslations("Strands");
  const searchParams = useSearchParams();
  const [drawerState, setDrawerState] = useState<
    "closed" | "opening" | "open" | "closing"
  >("closed");
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [drawerPosition, setDrawerPosition] = useState({
    left: 12,
    width: 352,
  });
  const isDrawerMounted = drawerState !== "closed";
  const isWordlePracticeActive =
    currentSlug === "wordle" && searchParams.get("mode") === "practice";
  const isWordleDailyActive = currentSlug === "wordle" && !isWordlePracticeActive;
  const isStrandsDailyActive =
    currentSlug === "strands" && searchParams.get("mode") !== "practice";
  const wordleBaseHref = "/";

  const closeDrawer = useCallback(() => {
    setDrawerState((current) =>
      current === "closed" || current === "closing" ? current : "closing",
    );
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerState((current) => (current === "closed" ? "opening" : current));
  }, []);

  useEffect(() => {
    if (!isDrawerMounted) return;

    const updateDrawerPosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPadding = 12;
      const idealWidth = 352;
      const isMobileViewport = window.innerWidth < 640;
      const left = isMobileViewport ? 0 : Math.max(viewportPadding, rect.left);
      const availableWidth = Math.max(
        0,
        window.innerWidth - left - viewportPadding,
      );
      const minWidth = Math.min(280, availableWidth);
      const width = Math.max(minWidth, Math.min(idealWidth, availableWidth));

      setDrawerPosition({
        left,
        width,
      });
    };

    updateDrawerPosition();
    window.addEventListener("resize", updateDrawerPosition);

    return () => {
      window.removeEventListener("resize", updateDrawerPosition);
    };
  }, [closeDrawer, isDrawerMounted]);

  useEffect(() => {
    if (drawerState === "opening") {
      const raf = window.requestAnimationFrame(() => setDrawerState("open"));
      return () => window.cancelAnimationFrame(raf);
    }

    if (drawerState === "closing") {
      const timeout = window.setTimeout(() => setDrawerState("closed"), 180);
      return () => window.clearTimeout(timeout);
    }
  }, [drawerState]);

  return (
    <>
        <header
          className={cn(
            "site-header-surface sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md",
            currentSlug === "stackdown" && "site-header--stackdown",
            currentSlug === "wordle" && "site-header--wordle",
            currentSlug === "strands" && "site-header--strands",
          )}
        >
        <div className="mx-auto flex min-h-14 w-full max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span ref={anchorRef} className="inline-flex">
              <Button
                type="button"
                variant="ghost"
                className="size-11 rounded-full text-foreground/68 hover:text-foreground"
                aria-label={t("openMenu")}
                onClick={openDrawer}
              >
                <Menu aria-hidden />
              </Button>
            </span>

            <div className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-medium tracking-[0.24em] text-foreground/58 uppercase",
                  currentSlug === "stackdown" && "site-header-game-label",
                )}
              >
                {t("siteName")}
              </p>
              <Link
                href="/"
                className="block truncate text-lg font-semibold tracking-[-0.02em] text-foreground"
              >
                {pageTitle}
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <HelpModal game={currentSlug} />
            {currentSlug === "wordle" ? (
              <WordleStatsModal isAuthenticated={isAuthenticated} />
            ) : null}
            {currentSlug === "stackdown" ? (
              <StackdownStatsModal isAuthenticated={isAuthenticated} />
            ) : null}
            {isStrandsDailyActive ? (
              <Button
                type="button"
                variant="ghost"
                className="size-11 rounded-full text-foreground/68 hover:text-foreground"
                aria-label={tStrands("results")}
                onClick={requestStrandsResults}
              >
                <BarChart3 aria-hidden />
              </Button>
            ) : null}
            {isAuthenticated && user ? (
              <UserProfileTrigger user={user} />
            ) : (
              <LoginModal />
            )}
          </div>
        </div>
      </header>

      <GameModalShell
        open={isDrawerMounted}
        onClose={closeDrawer}
        variant="drawer"
        titleId="site-menu-title"
        closeButtonAriaLabel={t("closeMenu")}
        showCloseButton={false}
        classNames={{
          overlay:
            drawerState === "closing"
              ? "menu-drawer-overlay-exit"
              : "menu-drawer-overlay-enter",
          panel:
            drawerState === "closing" ? "menu-drawer-exit" : "menu-drawer-enter",
        }}
        styles={{
          panel: {
            left: `${drawerPosition.left}px`,
            width: `${drawerPosition.width}px`,
            maxWidth: `calc(100vw - ${drawerPosition.left}px)`,
            height: "100dvh",
            maxHeight: "100dvh",
          },
        }}
      >
        <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3 border-b border-border px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-[0.24em] text-foreground/58 uppercase">
                        {t("siteName")}
                      </p>
                      <h2
                        id="site-menu-title"
                        className="mt-1 truncate text-xl font-semibold tracking-[-0.02em]"
                      >
                        {pageTitle}
                      </h2>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-11 shrink-0 rounded-full text-foreground/68 hover:text-foreground"
                      aria-label={t("closeMenu")}
                      data-overlay-close
                      data-overlay-initial-focus
                      onClick={closeDrawer}
                    >
                      <X aria-hidden />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.24em] text-foreground/58 uppercase">
                        {t("games")}
                      </p>
                      <nav className="mt-3 flex flex-col gap-2">
                        {games.map((game) => {
                          const isWordle = game.slug === "wordle";
                          const active = currentSlug === game.slug;

                          return (
                            isWordle && game.status === "available" ? (
                              <div
                                key={game.slug}
                                className={cn(
                                  "rounded-[1.25rem] border px-4 py-3.5 transition-all",
                                  active
                                    ? "border-brand/25 bg-brand/12 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.35)]"
                                    : "border-transparent bg-muted/55",
                                )}
                              >
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                                  <p className="truncate text-[0.95rem] font-semibold tracking-[-0.02em]">
                                    {game.title[locale]}
                                  </p>
                                  <span
                                    className="inline-flex h-8 shrink-0 items-center rounded-full bg-brand/15 px-3 text-[10px] font-medium tracking-[0.16em] text-brand uppercase whitespace-nowrap"
                                  >
                                    {t("availableNow")}
                                  </span>
                                  <p className="col-span-2 truncate text-[13px] text-muted-foreground">
                                    {game.description[locale]}
                                  </p>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <Link
                                    href={wordleBaseHref}
                                    onClick={closeDrawer}
                                    aria-current={isWordleDailyActive ? "page" : undefined}
                                    className={cn(
                                      "inline-flex h-11 w-full items-center justify-center rounded-full border px-3 text-center text-[11px] font-medium tracking-[0.16em] uppercase transition-all",
                                      isWordleDailyActive
                                        ? "border-brand bg-brand text-brand-foreground"
                                        : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-background",
                                    )}
                                  >
                                    {t("dailyChallenge")}
                                  </Link>
                                  <Link
                                    href={{
                                      pathname: wordleBaseHref,
                                      query: { mode: "practice" },
                                    }}
                                    onClick={closeDrawer}
                                    aria-current={isWordlePracticeActive ? "page" : undefined}
                                    className={cn(
                                      "inline-flex h-11 w-full items-center justify-center rounded-full border px-3 text-center text-[11px] font-medium tracking-[0.16em] uppercase transition-all",
                                      isWordlePracticeActive
                                        ? "border-brand bg-brand text-brand-foreground"
                                        : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-background",
                                    )}
                                  >
                                    {t("practiceMode")}
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <Link
                                key={game.slug}
                                href={`/${game.slug}`}
                                onClick={closeDrawer}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "block rounded-[1.25rem] border px-4 py-3.5 transition-all",
                                  active
                                    ? "border-brand/25 bg-brand/12 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.35)]"
                                    : "border-transparent bg-muted/55 hover:bg-muted",
                                )}
                              >
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                                  <p className="truncate text-[0.95rem] font-semibold tracking-[-0.02em]">
                                    {game.title[locale]}
                                  </p>
                                  <span
                                    className={cn(
                                      "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[10px] font-medium tracking-[0.16em] uppercase whitespace-nowrap",
                                      game.status === "available"
                                        ? "bg-brand/15 text-brand"
                                        : "bg-secondary text-muted-foreground",
                                    )}
                                  >
                                    {game.status === "available"
                                      ? t("availableNow")
                                      : t("comingSoon")}
                                  </span>
                                  <p className="col-span-2 truncate text-[13px] text-muted-foreground">
                                    {game.description[locale]}
                                  </p>
                                </div>
                              </Link>
                            )
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  <div className="border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <p className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
                      {t("controls")}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-[1.25rem] bg-muted/55 px-3 py-2">
                      <LocaleSwitcher />
                      <SoundToggle />
                    </div>
                  </div>
        </div>
      </GameModalShell>
    </>
  );
}
