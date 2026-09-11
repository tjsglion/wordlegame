import { getTranslations } from "next-intl/server";
import { WORDS_PER_PUZZLE } from "@/games/stackdown/shared";
import {
  buildStackdownHelpCopy,
  StackdownHelpContent,
} from "@/components/help/stackdown-help-content";

export async function StackdownHelpSection() {
  const t = await getTranslations("StackdownHelp");
  const tGame = await getTranslations("Stackdown");

  const copy = buildStackdownHelpCopy(t, {
    title: t("seoTitle"),
    description: t("seoDescription"),
    demoLabels: {
      wordsLeft: tGame("wordsRemaining", { count: WORDS_PER_PUZZLE }),
      hintSlide: tGame("hintSlide"),
      hintRevealCta: tGame("hintRevealCta"),
      hintRevealDetail: tGame("hintRevealDetail"),
      hintClue: t("demoClue"),
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("seoTitle"),
    description: t("seoDescription"),
    step: [
      {
        "@type": "HowToStep",
        name: t("goalTitle"),
        text: t("goal"),
      },
      {
        "@type": "HowToStep",
        name: t("basicsTitle"),
        text: t("basics.pick"),
      },
      {
        "@type": "HowToStep",
        name: t("oneWordTitle"),
        text: t("oneWord"),
      },
      {
        "@type": "HowToStep",
        name: t("hintsTitle"),
        text: t("hints.stars"),
      },
    ],
  };

  return (
    <>
      <section className="sr-only">
        <StackdownHelpContent copy={copy} variant="section" />
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
