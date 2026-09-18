import { STRANDS_CELL_COUNT } from "./shared";

/**
 * Loading stand-in for the strands playfield, rendered by GameLoader's
 * `loading` fallback while the client chunk (ssr: false) is fetched.
 * Mirrors the real stage — safe-area padding, play-area slots and the grid's
 * dvh budget — so mount never shifts layout in either axis.
 */
export function StrandsGameSkeleton() {
  return (
    <div
      className="strands-game mx-auto flex w-full max-w-lg flex-1 flex-col px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
      aria-hidden
    >
      <div className="flex flex-col gap-2 pb-3">
        <div className="h-3 w-14 animate-pulse rounded-full bg-muted-foreground/15" />
        <div className="h-7 w-3/4 animate-pulse rounded-lg bg-muted-foreground/15" />
      </div>
      <div className="strands-play-area my-auto w-full">
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted-foreground/15" />
        <div className="strands-skeleton-grid">
          {Array.from({ length: STRANDS_CELL_COUNT }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        {/* Matches .strands-found's reserved slot. */}
        <div className="min-h-[2.4rem]" />
      </div>
    </div>
  );
}
