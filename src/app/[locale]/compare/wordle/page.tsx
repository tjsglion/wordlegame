type PreviewTone = "empty" | "filled" | "correct" | "present" | "absent";

type TileData = {
  letter: string;
  tone: PreviewTone;
};

const CURRENT_BOARD: TileData[][] = [
  [
    { letter: "C", tone: "present" },
    { letter: "R", tone: "present" },
    { letter: "A", tone: "correct" },
    { letter: "N", tone: "absent" },
    { letter: "E", tone: "present" },
  ],
  [
    { letter: "R", tone: "correct" },
    { letter: "E", tone: "correct" },
    { letter: "A", tone: "correct" },
    { letter: "C", tone: "correct" },
    { letter: "H", tone: "correct" },
  ],
  [
    { letter: "S", tone: "filled" },
    { letter: "T", tone: "filled" },
    { letter: "", tone: "empty" },
    { letter: "", tone: "empty" },
    { letter: "", tone: "empty" },
  ],
];

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Delete"],
] as const;

const KEY_TONES: Record<string, PreviewTone> = {
  A: "correct",
  C: "present",
  E: "correct",
  H: "correct",
  N: "absent",
  R: "correct",
};

function Tile({ letter, tone }: TileData) {
  const revealed = tone === "correct" || tone === "present" || tone === "absent";
  const frontFilled = tone === "filled";

  return (
    <div className="wordle-tile">
      <div className={`wordle-tile-inner ${revealed ? "flipped" : ""}`}>
        <div className={`wordle-face wordle-front ${frontFilled ? "filled" : ""}`}>
          {letter}
        </div>
        <div
          className={`wordle-face wordle-back ${
            revealed ? tone : ""
          }`}
        >
          {letter}
        </div>
      </div>
    </div>
  );
}

function BoardPreview() {
  return (
    <div className="wordle-board mx-auto grid w-full gap-2.5">
      {CURRENT_BOARD.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2.5">
          {row.map((tile, tileIndex) => (
            <Tile
              key={`${rowIndex}-${tileIndex}`}
              letter={tile.letter}
              tone={tile.tone}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function KeyboardPreview() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2 px-1">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((key) => {
            const tone = KEY_TONES[key] ?? "empty";
            const toneClass =
              tone === "correct" || tone === "present" || tone === "absent"
                ? tone
                : "";
            const wide = key === "Enter" || key === "Delete";
            return (
              <div
                key={key}
                className={`wordle-key ${toneClass} ${
                  wide ? "flex-[1.5] text-xs" : "flex-1 text-sm"
                } font-semibold uppercase`}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ResultPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl">
      <div className="flex flex-col gap-3">
        <p className="text-center font-semibold">Brilliant! You got it</p>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            ["Played", "21"],
            ["Win %", "81"],
            ["Streak", "6"],
            ["Best", "9"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-lg font-bold tabular-nums">{value}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <div key={count} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right tabular-nums">{count}</span>
              <div
                className={`h-4 rounded-sm ${
                  count === 2 ? "bg-wordle-correct" : "bg-muted-foreground/35"
                }`}
                style={{ width: `${count === 2 ? 74 : 16 + count * 8}%` }}
              />
              <span className="tabular-nums">{count === 2 ? 12 : count - 1}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground tabular-nums">
          Next puzzle in 11:42:08
        </p>

        <div className="flex flex-col gap-2">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
            Share result
          </div>
          <div className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium">
            View leaderboard
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  title,
  subtitle,
  stageClassName,
  notes,
}: {
  title: string;
  subtitle: string;
  stageClassName: string;
  notes: string[];
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/80 p-4 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className={`rounded-[1.5rem] border border-border/70 p-4 ${stageClassName}`}>
        <div className="mx-auto flex max-w-sm flex-col gap-5">
          <BoardPreview />
          <KeyboardPreview />
          <ResultPanel />
        </div>
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function WordleComparePage({
  params,
}: PageProps<"/[locale]/compare/wordle">) {
  const { locale } = await params;
  const homeHref = `/${locale}`;

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground">
      <style>{`
        .compare-current {
          background: oklch(0.975 0.028 92);
        }

        .compare-refined {
          --wordle-correct: oklch(0.76 0.16 150);
          --wordle-present: oklch(0.82 0.13 92);
          --wordle-absent: oklch(0.72 0.008 95);
          --wordle-ink: oklch(0.245 0.006 70);
          --wordle-pop-ink: oklch(0.245 0.006 70);
          --wordle-tile-bg: oklch(0.998 0.001 95);
          --wordle-tile-bg-filled: oklch(0.975 0.02 94);
          --wordle-key-bg: oklch(0.994 0.002 95);
          background: oklch(0.982 0.014 94);
        }

        .compare-refined .wordle-front {
          border-width: 2px;
          box-shadow: 2px 2px 0 color-mix(in oklab, var(--wordle-ink) 78%, transparent);
        }

        .compare-refined .wordle-back {
          border-width: 2px;
          box-shadow: 2px 2px 0 color-mix(in oklab, var(--wordle-pop-ink) 72%, transparent);
        }

        .compare-refined .wordle-key {
          border-width: 1.5px;
          box-shadow: 1.5px 1.5px 0 color-mix(in oklab, var(--wordle-ink) 58%, transparent);
        }

        .compare-refined .wordle-key.correct,
        .compare-refined .wordle-key.present,
        .compare-refined .wordle-key.absent {
          box-shadow: 1.5px 1.5px 0 color-mix(in oklab, var(--wordle-pop-ink) 60%, transparent);
        }

        .compare-refined .rounded-2xl.border.border-border.bg-card.p-4.shadow-2xl {
          border-color: color-mix(in oklab, var(--border) 75%, transparent);
          background: color-mix(in oklab, var(--card) 98%, white);
          box-shadow: 0 18px 48px -28px rgba(0, 0, 0, 0.22);
        }
      `}</style>

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <a
            href={homeHref}
            className="text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            返回首页
          </a>
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Wordle Visual Compare
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              当前版 vs 收敛版
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              这个页面只用于视觉判断，不改现有玩法逻辑。左边是你现在这套更有品牌个性的
              Wordle，右边是我建议的 Classic+ 收敛版：背景更退后、阴影更轻、absent
              更中性、键盘和结算面板更安静。
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="当前版"
            subtitle="高识别度、品牌感更强，但非语义视觉权重偏高。"
            stageClassName="compare-current"
            notes={[
              "暖纸底存在感更强，页面整体更有设计态度。",
              "Tile 和键盘的描边、阴影都比较重，截图辨识度高。",
              "Absent 偏暖石色，统一感更好，但离经典 Wordle 心智更远。",
            ]}
          />

          <PreviewCard
            title="收敛版"
            subtitle="更贴近 Wordle 品类最优体验，但保留你的品牌气质。"
            stageClassName="compare-refined"
            notes={[
              "背景退后，用户第一眼更聚焦棋盘语义反馈。",
              "Tile 和键盘依然有结构感，但不再和结果色抢戏。",
              "Absent 回到更中性的灰，玩法理解更直观，耐玩感更强。",
            ]}
          />
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4 text-sm text-muted-foreground">
          推荐你最终走右侧这条线：保留暖底和品牌壳层，但把视觉主角重新交给格子状态与解谜反馈。
        </div>
      </div>
    </main>
  );
}
