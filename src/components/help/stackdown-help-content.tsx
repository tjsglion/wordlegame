import type { CSSProperties, ComponentType } from "react";
import {
  DemoHint,
  DemoPick,
  DemoUncover,
  DemoUndo,
  DemoWord,
  DemoWrong,
  type DemoLabels,
} from "@/components/help/stackdown-help-demos";

/** The "How it plays" step ids — message keys live under `basics.<id>`. */
export const STACKDOWN_STEP_IDS = [
  "pick",
  "slot",
  "submit",
  "invalid",
  "undo",
] as const;

export type StackdownStepId = (typeof STACKDOWN_STEP_IDS)[number];

/** Demo paired with each step, keyed by step id so copy order can't drift. */
const STEP_DEMOS: Record<StackdownStepId, ComponentType<{ labels: DemoLabels }>> = {
  pick: DemoPick,
  slot: DemoUncover,
  submit: DemoWord,
  invalid: DemoWrong,
  undo: DemoUndo,
};

export interface StackdownHelpCopy {
  title: string;
  description: string;
  goalTitle: string;
  goal: string;
  basicsTitle: string;
  basics: Array<{ id: StackdownStepId; text: string }>;
  stackTitle: string;
  stackExposedTitle: string;
  stackExposedCaption: string;
  stackCoveredTitle: string;
  stackCoveredCaption: string;
  oneWordTitle: string;
  oneWord: string;
  hintsTitle: string;
  /** UI strings shown inside the demo scenes (message row + hint slider). */
  demoLabels: DemoLabels;
  hints: string[];
  timerTitle: string;
  timer: string[];
  tipsTitle: string;
  tips: string[];
}

/**
 * Builds the copy bag shared by the modal (client, `useTranslations`) and the
 * SEO section (server, `getTranslations`) — both hand us their namespace's
 * `t` plus the variant-specific title/description and the game's own UI
 * strings (`Stackdown.wordsRemaining` / `Stackdown.hintSlide`, plus the
 * demo-only clue text under `demoClue`).
 */
export function buildStackdownHelpCopy(
  t: (key: string) => string,
  variant: { title: string; description: string; demoLabels: DemoLabels },
): StackdownHelpCopy {
  return {
    title: variant.title,
    description: variant.description,
    goalTitle: t("goalTitle"),
    goal: t("goal"),
    basicsTitle: t("basicsTitle"),
    basics: STACKDOWN_STEP_IDS.map((id) => ({ id, text: t(`basics.${id}`) })),
    stackTitle: t("stackTitle"),
    stackExposedTitle: t("stack.exposedTitle"),
    stackExposedCaption: t("stack.exposedCaption"),
    stackCoveredTitle: t("stack.coveredTitle"),
    stackCoveredCaption: t("stack.coveredCaption"),
    oneWordTitle: t("oneWordTitle"),
    oneWord: t("oneWord"),
    hintsTitle: t("hintsTitle"),
    demoLabels: variant.demoLabels,
    hints: [t("hints.slider"), t("hints.stars"), t("hints.floor")],
    timerTitle: t("timerTitle"),
    timer: [t("timer.runs"), t("timer.hidden"), t("timer.score")],
    tipsTitle: t("tipsTitle"),
    tips: [t("tips.whichTile"), t("tips.daily"), t("tips.leaderboard")],
  };
}

function MiniTile({
  letter,
  covered = false,
  className = "",
  style,
}: {
  letter: string;
  covered?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`sdh-mini-tile${covered ? " covered" : ""} flex items-center justify-center font-black uppercase ${className}`}
      style={style}
    >
      <span>{letter}</span>
    </div>
  );
}

/**
 * A pocket version of the real board: four buried tiles with one bright tile
 * resting on top, so "exposed vs covered" is visible at a glance.
 */
function MiniStack() {
  const buried: Array<{ letter: string; left: string; top: string }> = [
    { letter: "S", left: "8%", top: "8%" },
    { letter: "T", left: "56%", top: "8%" },
    { letter: "A", left: "8%", top: "56%" },
    { letter: "K", left: "56%", top: "56%" },
  ];
  return (
    <div
      aria-hidden
      className="sdh-mini-stack relative mx-auto aspect-square w-44 rounded-[8%]"
    >
      {buried.map((tile) => (
        <MiniTile
          key={tile.letter}
          letter={tile.letter}
          covered
          className="absolute rounded-[13%] text-lg"
          style={{ left: tile.left, top: tile.top, width: "32%", height: "32%" }}
        />
      ))}
      <MiniTile
        letter="C"
        className="absolute rounded-[13%] text-lg"
        style={{ left: "32%", top: "32%", width: "32%", height: "32%" }}
      />
    </div>
  );
}

export function StackdownHelpContent({
  copy,
  variant = "modal",
  titleId,
  descriptionId,
}: {
  copy: StackdownHelpCopy;
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
  const headingClass =
    "text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground";
  // Demos are visual garnish — the SEO/section variant stays text-only.
  const showDemos = variant === "modal";

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
        {showDemos ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.basics.map((item, index) => {
              const Demo = STEP_DEMOS[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-[1.25rem] border border-border/80 bg-background p-4"
                >
                  <Demo labels={copy.demoLabels} />
                  <p className="mt-4 flex gap-3 text-sm leading-6 text-foreground/92">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                      {index + 1}
                    </span>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="mt-4 space-y-3 text-sm leading-6 text-foreground/92 sm:text-base">
            {copy.basics.map((item, index) => (
              <li key={item.id} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground ring-1 ring-border">
                  {index + 1}
                </span>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-5">
        <h3 className={headingClass}>{copy.stackTitle}</h3>
        <div className="mt-4 rounded-[1.25rem] border border-border/80 bg-background px-4 py-5 sm:px-5">
          <MiniStack />
          <ul className="mt-5 divide-y divide-border/70">
            <li className="flex items-center gap-3 py-3">
              <MiniTile
                letter="C"
                className="size-10 shrink-0 rounded-[0.45rem] text-base"
              />
              <div>
                <p className="text-sm font-semibold">{copy.stackExposedTitle}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.stackExposedCaption}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3 py-3">
              <MiniTile
                letter="S"
                covered
                className="size-10 shrink-0 rounded-[0.45rem] text-base"
              />
              <div>
                <p className="text-sm font-semibold">{copy.stackCoveredTitle}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.stackCoveredCaption}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5">
        <h3 className={headingClass}>{copy.oneWordTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-foreground/92 sm:text-base">
          {copy.oneWord}
        </p>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5">
        <h3 className={headingClass}>{copy.hintsTitle}</h3>
        {showDemos ? (
          <div className="mt-4">
            <DemoHint labels={copy.demoLabels} />
          </div>
        ) : null}
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {copy.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5">
        <h3 className={headingClass}>{copy.timerTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {copy.timer.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4 sm:p-5">
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
