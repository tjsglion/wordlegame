import type { ReactNode } from "react";

type HelpTileTone = "correct" | "present" | "absent" | "idle";

export interface HelpLegendItemCopy {
  tone: "correct" | "present" | "absent";
  title: string;
  description: string;
  exampleCaption: string;
}

export interface HelpContentCopy {
  title: string;
  description: string;
  basicsTitle: string;
  basics: string[];
  colorsTitle: string;
  colors: HelpLegendItemCopy[];
  walkthroughTitle: string;
  walkthroughIntro: string;
  exampleAnswerLabel: string;
  exampleAnswer: string;
  exampleGuessLabel: string;
  exampleGuess: string;
  walkthroughPoints: string[];
  walkthroughSummary: string;
  repeatsTitle: string;
  repeatsIntro: string;
  repeatsAnswer: string;
  repeatsGuess: string;
  repeatsSummary: string;
  tipsTitle: string;
  tips: string[];
}

function HelpTile({
  letter,
  tone,
}: {
  letter: string;
  tone: HelpTileTone;
}) {
  const toneClass = {
    correct: "bg-wordle-correct text-white",
    present: "bg-wordle-present text-white",
    absent: "bg-wordle-absent text-white",
    idle: "border border-border bg-background text-foreground",
  }[tone];

  return (
    <div
      aria-hidden
      className={`flex size-11 items-center justify-center rounded-[0.28rem] text-lg font-bold uppercase shadow-sm sm:size-12 ${toneClass}`}
    >
      {letter}
    </div>
  );
}

function ExampleWordRow({
  word,
  tones,
  label,
}: {
  word: string;
  tones: HelpTileTone[];
  label: string;
}) {
  return (
    <div className="grid w-fit grid-cols-5 gap-1.5" aria-label={label}>
      {Array.from(word).map((letter, index) => (
        <HelpTile
          key={`${word}-${index}`}
          letter={letter}
          tone={tones[index] ?? "idle"}
        />
      ))}
    </div>
  );
}

const COLOR_ROWS: Record<
  HelpLegendItemCopy["tone"],
  { word: string; tones: HelpTileTone[] }
> = {
  correct: {
    word: "WATER",
    tones: ["correct", "idle", "idle", "idle", "idle"],
  },
  present: {
    word: "LIGHT",
    tones: ["idle", "present", "idle", "idle", "idle"],
  },
  absent: {
    word: "SOUND",
    tones: ["idle", "idle", "absent", "idle", "idle"],
  },
};

const WALKTHROUGH_TONES: HelpTileTone[] = [
  "present",
  "present",
  "correct",
  "absent",
  "present",
];

const REPEAT_TONES: HelpTileTone[] = [
  "present",
  "absent",
  "absent",
  "correct",
  "absent",
];

function ExampleCard({
  title,
  subtitle,
  word,
  tones,
  caption,
  footer,
  label,
}: {
  title: string;
  subtitle?: string;
  word: string;
  tones: HelpTileTone[];
  caption: string;
  footer?: ReactNode;
  label: string;
}) {
  return (
    <div className="py-2">
      <div className="text-center">
        <p className="text-sm font-semibold">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex justify-center">
        <ExampleWordRow word={word} tones={tones} label={label} />
      </div>

      <p className="mt-4 text-center text-sm leading-6 text-foreground/88">
        {caption}
      </p>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

export function HelpContent({
  copy,
  variant = "modal",
  titleId,
  descriptionId,
}: {
  copy: HelpContentCopy;
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
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {copy.basicsTitle}
        </h3>
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

      <section className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {copy.colorsTitle}
        </h3>
        <div className="mt-4 divide-y divide-border/70 rounded-[1.25rem] border border-border/80 bg-background px-4 sm:px-5">
          {copy.colors.map((item) => {
            const row = COLOR_ROWS[item.tone];
            return (
              <ExampleCard
                key={item.tone}
                title={item.title}
                subtitle={item.description}
                word={row.word}
                tones={row.tones}
                caption={item.exampleCaption}
                label={`${item.title} example`}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {copy.walkthroughTitle}
        </h3>
        <div className="mt-4 divide-y divide-border/70 rounded-[1.25rem] border border-border/80 bg-background px-4 sm:px-5">
          <ExampleCard
            title={copy.walkthroughIntro}
            subtitle={`${copy.exampleAnswerLabel}: ${copy.exampleAnswer}`}
            word={copy.exampleGuess}
            tones={WALKTHROUGH_TONES}
            caption={copy.walkthroughSummary}
            label="Full Wordle walkthrough example"
            footer={
              <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
                {copy.walkthroughPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            }
          />

          <ExampleCard
            title={copy.repeatsTitle}
            subtitle={`${copy.exampleAnswerLabel}: ${copy.repeatsAnswer}`}
            word={copy.repeatsGuess}
            tones={REPEAT_TONES}
            caption={copy.repeatsSummary}
            label="Repeated letters example"
            footer={
              <p className="text-sm leading-6 text-muted-foreground">
                {copy.repeatsIntro}
              </p>
            }
          />
        </div>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {copy.tipsTitle}
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {copy.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
