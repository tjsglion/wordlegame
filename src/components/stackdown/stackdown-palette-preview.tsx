"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PaletteId = "graphite" | "slate" | "moss";

interface Palette {
  id: PaletteId;
  title: string;
  subtitle: string;
  description: string;
  recommended?: boolean;
  board: string;
  boardEdge: string;
  buried: string;
  buriedEdge: string;
  tile: string;
  tileEdge: string;
  tileText: string;
  accent: string;
  ink: string;
}

const PALETTES: Palette[] = [
  {
    id: "graphite",
    title: "石墨纸牌",
    subtitle: "推荐",
    description: "棋盘回归暖石墨灰，青绿只承担可操作与进度提示。",
    recommended: true,
    board: "oklch(0.34 0.012 82)",
    boardEdge: "oklch(0.27 0.01 82)",
    buried: "oklch(0.31 0.011 82)",
    buriedEdge: "oklch(0.23 0.009 82)",
    tile: "oklch(0.9 0.012 90)",
    tileEdge: "oklch(0.54 0.018 82)",
    tileText: "oklch(0.27 0.012 72)",
    accent: "oklch(0.72 0.09 165)",
    ink: "oklch(0.93 0.008 90)",
  },
  {
    id: "slate",
    title: "深海蓝灰",
    subtitle: "冷静、现代",
    description: "用低彩度蓝灰替代绿面，保留一点更独立的游戏感。",
    board: "oklch(0.33 0.025 240)",
    boardEdge: "oklch(0.25 0.022 240)",
    buried: "oklch(0.3 0.022 240)",
    buriedEdge: "oklch(0.22 0.018 240)",
    tile: "oklch(0.9 0.008 92)",
    tileEdge: "oklch(0.52 0.016 235)",
    tileText: "oklch(0.25 0.016 245)",
    accent: "oklch(0.72 0.075 190)",
    ink: "oklch(0.93 0.008 90)",
  },
  {
    id: "moss",
    title: "灰苔绿",
    subtitle: "保留桌游感",
    description: "把绿色压到接近煤灰，仅留下安静的传统桌游气质。",
    board: "oklch(0.33 0.025 155)",
    boardEdge: "oklch(0.25 0.021 155)",
    buried: "oklch(0.3 0.023 155)",
    buriedEdge: "oklch(0.22 0.018 155)",
    tile: "oklch(0.9 0.012 90)",
    tileEdge: "oklch(0.52 0.019 150)",
    tileText: "oklch(0.25 0.015 150)",
    accent: "oklch(0.72 0.08 165)",
    ink: "oklch(0.93 0.008 90)",
  },
];

const BURIED_TILES = [
  [8, 40, "U"],
  [8, 61, "W"],
  [25, 20, "Y"],
  [25, 41, "A"],
  [25, 62, "R"],
  [43, 10, "B"],
  [43, 30, "O"],
  [43, 50, "R"],
  [43, 70, "T"],
  [61, 20, "L"],
  [61, 41, "S"],
  [61, 62, "H"],
] as const;

const EXPOSED_TILES = [
  [36, 38, "C"],
  [36, 57, "U"],
  [55, 38, "H"],
  [55, 57, "P"],
] as const;

function MiniStack({ palette }: { palette: Palette }) {
  return (
    <div
      className="relative mx-auto mt-5 aspect-square w-full max-w-[17rem] overflow-hidden rounded-[1.15rem] border p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      style={{
        backgroundColor: palette.board,
        borderColor: palette.boardEdge,
        boxShadow: `inset 0 0 0 1px ${palette.boardEdge}, inset 0 -14px 22px ${palette.boardEdge}`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${palette.ink} 1px, transparent 0)`,
          backgroundSize: "12px 12px",
        }}
      />
      {BURIED_TILES.map(([top, left, letter]) => (
        <div
          key={`${top}-${left}`}
          className="absolute flex h-[19%] w-[19%] items-center justify-center rounded-[0.65rem] text-[clamp(1rem,5cqw,1.65rem)] font-black"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            backgroundColor: palette.buriedEdge,
            color: palette.ink,
          }}
        >
          <span
            className="absolute inset-x-0 top-0 flex h-[88%] items-center justify-center rounded-[0.65rem]"
            style={{ backgroundColor: palette.buried }}
          >
            {letter}
          </span>
        </div>
      ))}
      {EXPOSED_TILES.map(([top, left, letter]) => (
        <div
          key={`${top}-${left}`}
          className="absolute flex h-[19%] w-[19%] items-center justify-center rounded-[0.65rem] text-[clamp(1rem,5cqw,1.65rem)] font-black shadow-[0_8px_12px_-8px_rgba(0,0,0,0.8)]"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            backgroundColor: palette.tileEdge,
            color: palette.tileText,
          }}
        >
          <span
            className="absolute inset-x-0 top-0 flex h-[88%] items-center justify-center rounded-[0.65rem]"
            style={{ backgroundColor: palette.tile }}
          >
            {letter}
          </span>
        </div>
      ))}
    </div>
  );
}

function PaletteCard({
  palette,
  selected,
  onSelect,
}: {
  palette: Palette;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "relative rounded-[1.5rem] border p-4 transition-colors sm:p-5",
        selected
          ? "border-brand/70 bg-card shadow-[0_18px_44px_-34px_var(--shadow-color)]"
          : "border-border/80 bg-card/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">{palette.title}</h2>
            {palette.recommended ? (
              <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.12em] text-brand uppercase">
                推荐
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{palette.subtitle}</p>
        </div>
        <span
          className="mt-1 size-4 rounded-full border border-white/15"
          style={{ backgroundColor: palette.accent }}
          aria-label={`${palette.title} 的强调色`}
        />
      </div>

      <MiniStack palette={palette} />

      <p className="mt-4 min-h-10 text-sm leading-6 text-muted-foreground">
        {palette.description}
      </p>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          selected
            ? "border-brand bg-brand text-brand-foreground"
            : "border-border bg-background text-foreground hover:border-brand/45 hover:bg-brand/8",
        )}
        aria-pressed={selected}
      >
        {selected ? <Check className="size-4" aria-hidden /> : null}
        {selected ? "当前选择" : "选择此方案"}
      </button>
    </article>
  );
}

export function StackdownPalettePreview() {
  const [selected, setSelected] = useState<PaletteId>("graphite");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand">Stackdown 配色试用</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          选择棋盘在暗色界面的存在感
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          三个方案都沿用暖炭黑页面与纸砖，只调整棋盘的主色。点选任一方案后，将它的状态标为当前选择。
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PALETTES.map((palette) => (
          <PaletteCard
            key={palette.id}
            palette={palette}
            selected={selected === palette.id}
            onSelect={() => setSelected(palette.id)}
          />
        ))}
      </div>
    </section>
  );
}
