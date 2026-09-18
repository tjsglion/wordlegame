import { getTranslations } from "next-intl/server";
import {
  buildWordplayHelpCopy,
  WordplayHelpContent,
} from "@/components/help/wordplay-help-content";

export async function WordplayHelpSection() {
  const t = await getTranslations("WordplayHelp");
  const copy = buildWordplayHelpCopy(t, {
    title: t("seoTitle"),
    description: t("seoDescription"),
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("seoTitle"),
    description: t("seoDescription"),
    step: [
      { "@type": "HowToStep", name: t("goalTitle"), text: t("goal") },
      { "@type": "HowToStep", name: t("basicsTitle"), text: t("basics.trace") },
      { "@type": "HowToStep", name: t("bonusTitle"), text: t("bonus") },
      { "@type": "HowToStep", name: t("hintsTitle"), text: t("hints.hint") },
    ],
  };

  return (
    <>
      <section className="sr-only">
        <WordplayHelpContent copy={copy} variant="section" />
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
