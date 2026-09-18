"use client";

import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { GameModalShell } from "@/components/game/game-modal-shell";
import { HelpContent, type HelpContentCopy } from "@/components/help/help-content";
import {
  buildStackdownHelpCopy,
  StackdownHelpContent,
} from "@/components/help/stackdown-help-content";
import {
  StrandsHelpContent,
  type StrandsHelpCopy,
} from "@/components/help/strands-help-content";
import {
  buildWordplayHelpCopy,
  WordplayHelpContent,
} from "@/components/help/wordplay-help-content";
import { Button } from "@/components/ui/button";
import type { GameSlug } from "@/lib/game/types";
import { WORDS_PER_PUZZLE } from "@/games/stackdown/shared";

function buildWordleCopy(tHelp: (key: string) => string): HelpContentCopy {
  return {
    title: tHelp("title"),
    description: tHelp("description"),
    basicsTitle: tHelp("basicsTitle"),
    basics: [
      tHelp("basics.guess"),
      tHelp("basics.submit"),
      tHelp("basics.clues"),
    ],
    colorsTitle: tHelp("colorsTitle"),
    colors: [
      {
        tone: "correct",
        title: tHelp("colors.correct.title"),
        description: tHelp("colors.correct.description"),
        exampleCaption: tHelp("colors.correct.exampleCaption"),
      },
      {
        tone: "present",
        title: tHelp("colors.present.title"),
        description: tHelp("colors.present.description"),
        exampleCaption: tHelp("colors.present.exampleCaption"),
      },
      {
        tone: "absent",
        title: tHelp("colors.absent.title"),
        description: tHelp("colors.absent.description"),
        exampleCaption: tHelp("colors.absent.exampleCaption"),
      },
    ],
    walkthroughTitle: tHelp("walkthroughTitle"),
    walkthroughIntro: tHelp("walkthroughIntro"),
    exampleAnswerLabel: tHelp("exampleAnswerLabel"),
    exampleAnswer: tHelp("exampleAnswer"),
    exampleGuessLabel: tHelp("exampleGuessLabel"),
    exampleGuess: tHelp("exampleGuess"),
    walkthroughPoints: [
      tHelp("walkthroughPoints.one"),
      tHelp("walkthroughPoints.two"),
      tHelp("walkthroughPoints.three"),
      tHelp("walkthroughPoints.four"),
      tHelp("walkthroughPoints.five"),
    ],
    walkthroughSummary: tHelp("walkthroughSummary"),
    repeatsTitle: tHelp("repeatsTitle"),
    repeatsIntro: tHelp("repeatsIntro"),
    repeatsAnswer: tHelp("repeatsAnswer"),
    repeatsGuess: tHelp("repeatsGuess"),
    repeatsSummary: tHelp("repeatsSummary"),
    tipsTitle: tHelp("tipsTitle"),
    tips: [
      tHelp("tips.duplicates"),
      tHelp("tips.keyboard"),
      tHelp("tips.strategy"),
    ],
  };
}

export const OPEN_HELP_MODAL_EVENT = "help:open";

/** Ask the site header's HelpModal to open for `game` (first-visit guidance). */
export function requestHelpModal(game: GameSlug): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_HELP_MODAL_EVENT, { detail: { game } }));
}

export function HelpModal({ game }: { game?: GameSlug }) {
  const tCommon = useTranslations("Common");
  const tHelp = useTranslations("HelpModal");
  const tStackdown = useTranslations("StackdownHelp");
  const tStackdownGame = useTranslations("Stackdown");
  const tStrandsHelp = useTranslations("StrandsHelp");
  const tWordplayHelp = useTranslations("WordplayHelp");
  const [open, setOpen] = useState(false);

  // Games can ask this modal to open (e.g. first-visit guidance) via a
  // window event — same pattern as the strands results event.
  useEffect(() => {
    const handler = (event: Event) => {
      if ((event as CustomEvent<{ game?: string }>).detail?.game === game) setOpen(true);
    };
    window.addEventListener(OPEN_HELP_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_HELP_MODAL_EVENT, handler);
  }, [game]);
  const strandsCopy: StrandsHelpCopy = {
    title: tStrandsHelp("title"),
    description: tStrandsHelp("description"),
    basicsTitle: tStrandsHelp("basicsTitle"),
    basics: [
      tStrandsHelp("basics.drag"),
      tStrandsHelp("basics.submit"),
      tStrandsHelp("basics.find"),
    ],
    spangramTitle: tStrandsHelp("spangramTitle"),
    spangram: tStrandsHelp("spangram"),
    hintsTitle: tStrandsHelp("hintsTitle"),
    hints: [tStrandsHelp("hints.charge"), tStrandsHelp("hints.reveal")],
    tipsTitle: tStrandsHelp("tipsTitle"),
    tips: [tStrandsHelp("tips.words"), tStrandsHelp("tips.mode")],
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="size-11 rounded-full text-foreground/68 hover:text-foreground"
        aria-label={tCommon("help")}
        onClick={() => setOpen(true)}
      >
        <CircleHelp aria-hidden />
      </Button>

      <GameModalShell
        open={open}
        onClose={() => setOpen(false)}
        variant="page"
        closeButtonAriaLabel={tCommon("close")}
        titleId="help-modal-title"
        descriptionId="help-modal-description"
      >
        <div>
          <div className="pr-12">
            <p className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              {tCommon("siteName")}
            </p>
          </div>
          {game === "stackdown" ? (
            <StackdownHelpContent
              copy={buildStackdownHelpCopy(tStackdown, {
                title: tStackdown("title"),
                description: tStackdown("description"),
                demoLabels: {
                  wordsLeft: tStackdownGame("wordsRemaining", {
                    count: WORDS_PER_PUZZLE,
                  }),
                  hintSlide: tStackdownGame("hintSlide"),
                  hintRevealCta: tStackdownGame("hintRevealCta"),
                  hintRevealDetail: tStackdownGame("hintRevealDetail"),
                  hintClue: tStackdown("demoClue"),
                },
              })}
              variant="modal"
              titleId="help-modal-title"
              descriptionId="help-modal-description"
            />
          ) : game === "strands" ? (
            <StrandsHelpContent
              copy={strandsCopy}
              variant="modal"
              titleId="help-modal-title"
              descriptionId="help-modal-description"
            />
          ) : game === "wordplay" ? (
            <WordplayHelpContent
              copy={buildWordplayHelpCopy(tWordplayHelp, {
                title: tWordplayHelp("title"),
                description: tWordplayHelp("description"),
              })}
              variant="modal"
              titleId="help-modal-title"
              descriptionId="help-modal-description"
            />
          ) : (
            <HelpContent
              copy={buildWordleCopy(tHelp)}
              variant="modal"
              titleId="help-modal-title"
              descriptionId="help-modal-description"
            />
          )}
        </div>
      </GameModalShell>
    </>
  );
}
