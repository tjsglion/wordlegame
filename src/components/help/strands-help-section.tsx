import { getTranslations } from "next-intl/server";
import {
  StrandsHelpContent,
  type StrandsHelpCopy,
} from "@/components/help/strands-help-content";

export async function StrandsHelpSection() {
  const t = await getTranslations("StrandsHelp");
  const copy: StrandsHelpCopy = {
    title: t("title"),
    description: t("description"),
    basicsTitle: t("basicsTitle"),
    basics: [t("basics.drag"), t("basics.submit"), t("basics.find")],
    spangramTitle: t("spangramTitle"),
    spangram: t("spangram"),
    hintsTitle: t("hintsTitle"),
    hints: [t("hints.charge"), t("hints.reveal")],
    tipsTitle: t("tipsTitle"),
    tips: [t("tips.words"), t("tips.mode")],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("title"),
    description: t("description"),
    step: copy.basics.map((text, index) => ({
      "@type": "HowToStep",
      name: `${index + 1}`,
      text,
    })),
  };

  return (
    <>
      <section className="sr-only">
        <StrandsHelpContent copy={copy} variant="section" />
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
