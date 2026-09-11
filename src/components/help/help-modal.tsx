"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { HelpContent, type HelpContentCopy } from "@/components/help/help-content";
import {
  buildStackdownHelpCopy,
  StackdownHelpContent,
} from "@/components/help/stackdown-help-content";
import { Button } from "@/components/ui/button";
import { useOverlayBehavior } from "@/components/ui/use-overlay-behavior";
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

export function HelpModal({ game }: { game?: GameSlug }) {
  const tCommon = useTranslations("Common");
  const tHelp = useTranslations("HelpModal");
  const tStackdown = useTranslations("StackdownHelp");
  const tStackdownGame = useTranslations("Stackdown");
  const [open, setOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useOverlayBehavior({
    open,
    portalRef,
    onClose: () => setOpen(false),
  });

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

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={portalRef}
              className="fixed inset-0 z-[60]"
              aria-modal="true"
              role="dialog"
              aria-labelledby="help-modal-title"
              aria-describedby="help-modal-description"
              tabIndex={-1}
            >
              <button
                type="button"
                aria-label={tCommon("close")}
                className="absolute inset-0 touch-none bg-black/28 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />

              <div className="pointer-events-none absolute inset-0 flex justify-center">
                <div
                  className={`pointer-events-auto relative h-dvh w-full max-w-4xl overflow-hidden bg-card shadow-2xl sm:border-x sm:border-border/80 ${
                    game === "stackdown" ? "stackdown-help-modal" : ""
                  }`}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 size-11 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label={tCommon("close")}
                    data-overlay-close
                    data-overlay-initial-focus
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden />
                  </Button>

                  <div className="h-dvh overflow-y-auto px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
                    ) : (
                      <HelpContent
                        copy={buildWordleCopy(tHelp)}
                        variant="modal"
                        titleId="help-modal-title"
                        descriptionId="help-modal-description"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
