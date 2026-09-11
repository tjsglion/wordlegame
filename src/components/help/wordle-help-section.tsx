import { getTranslations } from "next-intl/server";
import { HelpContent, type HelpContentCopy } from "@/components/help/help-content";

export async function WordleHelpSection() {
  const t = await getTranslations("HelpModal");

  const copy: HelpContentCopy = {
    title: t("seoTitle"),
    description: t("seoDescription"),
    basicsTitle: t("basicsTitle"),
    basics: [t("basics.guess"), t("basics.submit"), t("basics.clues")],
    colorsTitle: t("colorsTitle"),
    colors: [
      {
        tone: "correct",
        title: t("colors.correct.title"),
        description: t("colors.correct.description"),
        exampleCaption: t("colors.correct.exampleCaption"),
      },
      {
        tone: "present",
        title: t("colors.present.title"),
        description: t("colors.present.description"),
        exampleCaption: t("colors.present.exampleCaption"),
      },
      {
        tone: "absent",
        title: t("colors.absent.title"),
        description: t("colors.absent.description"),
        exampleCaption: t("colors.absent.exampleCaption"),
      },
    ],
    walkthroughTitle: t("walkthroughTitle"),
    walkthroughIntro: t("walkthroughIntro"),
    exampleAnswerLabel: t("exampleAnswerLabel"),
    exampleAnswer: t("exampleAnswer"),
    exampleGuessLabel: t("exampleGuessLabel"),
    exampleGuess: t("exampleGuess"),
    walkthroughPoints: [
      t("walkthroughPoints.one"),
      t("walkthroughPoints.two"),
      t("walkthroughPoints.three"),
      t("walkthroughPoints.four"),
      t("walkthroughPoints.five"),
    ],
    walkthroughSummary: t("walkthroughSummary"),
    repeatsTitle: t("repeatsTitle"),
    repeatsIntro: t("repeatsIntro"),
    repeatsAnswer: t("repeatsAnswer"),
    repeatsGuess: t("repeatsGuess"),
    repeatsSummary: t("repeatsSummary"),
    tipsTitle: t("tipsTitle"),
    tips: [t("tips.duplicates"), t("tips.keyboard"), t("tips.strategy")],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("seoTitle"),
    description: t("seoDescription"),
    step: [
      {
        "@type": "HowToStep",
        name: t("basicsTitle"),
        text: t("basics.guess"),
      },
      {
        "@type": "HowToStep",
        name: t("walkthroughTitle"),
        text: t("walkthroughSummary"),
      },
      {
        "@type": "HowToStep",
        name: t("colorsTitle"),
        text: t("basics.clues"),
      },
      {
        "@type": "HowToStep",
        name: t("repeatsTitle"),
        text: t("repeatsSummary"),
      },
    ],
  };

  return (
    <>
      <section className="sr-only">
        <HelpContent copy={copy} variant="section" />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
