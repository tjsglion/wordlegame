"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { requestHelpModal } from "@/components/help/help-modal";
import { loadGameData, saveGameData } from "@/lib/game/storage";
import { StrandsGrid } from "./strands-grid";
import { StrandsWinModal } from "./strands-win-modal";
import { useStrands, type StrandsMode } from "./use-strands";
import { getStrandsThemeLabel, getStrandsWordLabel, type StrandsPuzzleData } from "./shared";
import { OPEN_STRANDS_RESULTS_EVENT } from "./results";

const WinConfetti = dynamic(() => import("@/components/game/win-confetti"), { ssr: false });

export default function StrandsGame({
  strandsPuzzle,
}: {
  strandsPuzzle?: StrandsPuzzleData | null;
}) {
  const searchParams = useSearchParams();
  const mode: StrandsMode = searchParams.get("mode") === "practice" ? "practice" : "daily";
  return <StrandsPuzzle key={mode} mode={mode} puzzle={strandsPuzzle} />;
}

function StrandsPuzzle({
  puzzle,
  mode,
}: {
  puzzle?: StrandsPuzzleData | null;
  mode: StrandsMode;
}) {
  if (!puzzle) return <StrandsUnavailable />;
  return <StrandsGameBody key={puzzle.puzzle.id} mode={mode} puzzle={puzzle} />;
}

function StrandsUnavailable() {
  const t = useTranslations("Strands");
  return <div className="strands-game mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-3"><p role="status">{t("unavailable")}</p></div>;
}

function StrandsGameBody({ mode, puzzle }: { mode: StrandsMode; puzzle: StrandsPuzzleData }) {
  const t = useTranslations("Strands");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [confetti, setConfetti] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const game = useStrands(puzzle, mode, { showConfetti: () => setConfetti(true), stopConfetti: () => setConfetti(false), showWinModal: () => setResultOpen(true) });
  const { state } = game;
  const share = useCallback(() => { void game.share(); }, [game]);

  // Kill pull-to-refresh / overscroll bounce while a game is on screen
  // (scoped to the game container's lifetime, restored on unmount).
  useEffect(() => {
    const { body } = document;
    const previous = body.style.overscrollBehavior;
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overscrollBehavior = previous;
    };
  }, []);

  // First visit: show the how-to once (event mirrors the results-event
  // pattern; HelpModal lives in the site header). A restored in-progress
  // board is not interrupted — the intro appears on the next fresh puzzle.
  const foundCount = state.foundWords.length;
  useEffect(() => {
    if (!state.isLoaded || foundCount > 0) return;
    if (loadGameData<boolean>("strands", "help_seen", false)) return;
    saveGameData("strands", "help_seen", true);
    const id = window.setTimeout(() => requestHelpModal("strands"), 600);
    return () => window.clearTimeout(id);
  }, [foundCount, state.isLoaded]);

  // No permanent mode chrome: the other mode is offered contextually in the
  // result panel once the round ends.
  const navigateToMode = useCallback(
    (nextMode: StrandsMode) => {
      setResultOpen(false);
      router.replace(nextMode === "practice" ? `${pathname}?mode=practice` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // A randomly dealt practice board is immediately deep-linked. Reloads and
  // copied links therefore reopen the same board and its matching save.
  useEffect(() => {
    if (mode !== "practice") return;
    const sourcePuzzleId = puzzle.puzzle.id.replace(/^practice_/, "");
    if (searchParams.get("puzzle") === sourcePuzzleId) return;
    router.replace(`${pathname}?mode=practice&puzzle=${encodeURIComponent(sourcePuzzleId)}`, { scroll: false });
  }, [mode, pathname, puzzle.puzzle.id, router, searchParams]);

  useEffect(() => {
    const openResults = () => {
      if (mode === "daily") setResultOpen(true);
    };
    window.addEventListener(OPEN_STRANDS_RESULTS_EVENT, openResults);
    return () => window.removeEventListener(OPEN_STRANDS_RESULTS_EVENT, openResults);
  }, [mode]);

  return <div className="strands-game mx-auto flex w-full max-w-lg flex-1 touch-manipulation flex-col px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
    <header className="strands-header">
      <div>
        <p className="strands-eyebrow">{mode === "daily" ? t("modeDaily") : t("modePractice")}</p>
        <h2>{getStrandsThemeLabel(puzzle.puzzle)}</h2>
      </div>
      <div className="strands-header-meta">
        {state.isWon ? <span className="strands-complete-label">{t("complete")}</span> : null}
        <p className="strands-progress">{state.foundWords.length}/{puzzle.puzzle.words.length + 1}</p>
      </div>
    </header>

    {/* Toast slot: absolutely positioned so a notice never shifts the play area. */}
    <div className="relative h-0">{state.message && <div className="strands-toast" role="status">{state.message}</div>}</div>

    {/* my-auto centers the play group without justify-center's top-clipping:
     * on short viewports the auto margins collapse to zero and the group
     * flows from the top instead of being cut off. */}
    <div className="strands-play-area my-auto w-full">
      <section className="strands-controls" aria-label={t("gameControls")}>
        <button type="button" className="strands-hint-button" disabled={state.meter < 3 || state.isWon} onClick={game.useHint}>
          <span>{t("hint")} <b>{state.meter}/3</b></span>
          <span className="strands-meter" aria-hidden>{[0, 1, 2].map((index) => <i key={index} className={index < state.meter ? "is-filled" : undefined} />)}</span>
        </button>
        {state.isWon && <button type="button" className="strands-results-button" onClick={() => setResultOpen(true)}>{t("results")}</button>}
      </section>
      <StrandsGrid grid={puzzle.puzzle.grid} foundWords={state.foundWords} path={state.path} errorPath={state.errorPath} hintCells={state.hintCells} locked={state.isWon || !state.isLoaded} onPointerDown={game.pointerDown} onPointerMove={game.pointerMove} onPointerUp={game.pointerUp} onActivate={game.activateCell} />
      <section className="strands-found" aria-label={t("foundWords")}>{state.foundWords.map((found) => { const label = getStrandsWordLabel(puzzle.puzzle, found.word); return <span key={found.word} className={found.isSpangram ? "strands-chip is-spangram" : "strands-chip"}>{label}</span>; })}</section>
    </div>

    <StrandsWinModal open={resultOpen} mode={mode} hints={state.hints} stats={state.stats} isWon={state.isWon} found={state.foundWords.length} total={puzzle.puzzle.words.length + 1} onClose={() => setResultOpen(false)} onShare={share} onPlayPractice={() => navigateToMode("practice")} onBackToDaily={() => navigateToMode("daily")} />
    <WinConfetti play={confetti} duration={3000} onDone={() => setConfetti(false)} />
  </div>;
}
