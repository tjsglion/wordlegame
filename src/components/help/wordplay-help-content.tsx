export interface WordplayHelpCopy {
  title: string;
  description: string;
  goalTitle: string;
  goal: string;
  basicsTitle: string;
  basics: string[];
  bonusTitle: string;
  bonus: string;
  hintsTitle: string;
  hints: string[];
  tipsTitle: string;
  tips: string[];
}

/** Shared copy builder for the modal (client t) and the SEO section (server t). */
export function buildWordplayHelpCopy(
  t: (key: string) => string,
  variant: { title: string; description: string },
): WordplayHelpCopy {
  return {
    title: variant.title,
    description: variant.description,
    goalTitle: t("goalTitle"),
    goal: t("goal"),
    basicsTitle: t("basicsTitle"),
    basics: [t("basics.trace"), t("basics.submit"), t("basics.slots")],
    bonusTitle: t("bonusTitle"),
    bonus: t("bonus"),
    hintsTitle: t("hintsTitle"),
    hints: [t("hints.earn"), t("hints.hint")],
    tipsTitle: t("tipsTitle"),
    tips: [t("tips.direction"), t("tips.reuse"), t("tips.progress")],
  };
}

export function WordplayHelpContent({
  copy,
  variant = "modal",
  titleId,
  descriptionId,
}: {
  copy: WordplayHelpCopy;
  variant?: "modal" | "section";
  titleId?: string;
  descriptionId?: string;
}) {
  const titleClass =
    variant === "modal"
      ? "mt-2 text-2xl font-semibold tracking-[-0.02em]"
      : "mt-2 text-3xl font-semibold tracking-[-0.03em]";
  const sectionClass =
    variant === "modal"
      ? "mt-6 rounded-[1.5rem] bg-muted/35 p-4 sm:p-5"
      : "mt-6 rounded-[1.75rem] border border-border/80 bg-card/80 p-5 shadow-sm sm:p-6";
  const panelClass =
    "mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5";
  const headingClass =
    "text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground";

  return (
    <div>
      <div>
        <h2 id={titleId} className={titleClass}>
          {copy.title}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base"
        >
          {copy.description}
        </p>
      </div>

      <section className={sectionClass}>
        <h3 className={headingClass}>{copy.goalTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-foreground/92 sm:text-base">
          {copy.goal}
        </p>
      </section>

      <section className={sectionClass}>
        <h3 className={headingClass}>{copy.basicsTitle}</h3>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-foreground/92 sm:text-base">
          {copy.basics.map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground ring-1 ring-border">
                {index + 1}
              </span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={panelClass}>
        <h3 className={headingClass}>{copy.bonusTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-foreground/92 sm:text-base">
          {copy.bonus}
        </p>
      </section>

      <section className={panelClass}>
        <h3 className={headingClass}>{copy.hintsTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {copy.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </section>

      <section className={panelClass}>
        <h3 className={headingClass}>{copy.tipsTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {copy.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
