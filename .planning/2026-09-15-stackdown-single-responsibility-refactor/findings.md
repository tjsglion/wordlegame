# Findings & Decisions

## Requirements
- User approved a behavior-preserving, single-responsibility refactor of `src/games/stackdown/stackdown-game.tsx`.
- User additionally approved a behavior-preserving, single-responsibility refactor of `src/games/stackdown/use-stackdown.ts`.
- Existing working-tree modifications are user-owned unless this task writes them; do not revert or overwrite unrelated edits.
- New/retained overlays must use `GameModalShell`.

## Research Findings
- `stackdown-game.tsx` is a 1,277-line client component. It owns navigation, round assembly, tile-flight measurement/timers, board/slot rendering, hint-slider state, status displays, and two overlays.
- `useStackdown` owns gameplay, persistence, timer, sync, and server interaction. Its return contract is the correct stable boundary for the UI refactor.
- Existing `scripts/test-stackdown.ts` and `scripts/test-stackdown-sync.ts` exercise puzzle/API/sync behavior but do not mount the game component; browser validation is needed for the critical interactive path.
- Next.js 16 documentation confirms components using state, effects, handlers, browser APIs, or custom hooks must remain in the client component graph.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Extract board/slots, hint, flights, overlays, and round presentation into sibling modules | Each then has one UI responsibility and keeps `stackdown-game.tsx` as a small entry point. |
| Preserve CSS classes and translation keys | This limits visual and localization regression risk. |
| Keep the measured flight controller separate from board markup | It is the only module that owns DOM rectangles, animation timers, reduced-motion behavior, and return sequencing. |
| Extract Hook concerns through small dependency objects | The game state remains authoritative in the facade while each helper owns one effect/interaction concern, avoiding a risky reducer rewrite. |
| Share the stars component between the finished stage and result overlay | Both surfaces show the same hint-derived score, avoiding parity drift. |
| Give share/leaderboard effects and stage rendering their own modules | The round coordinator now only wires hook state, local UI state, and module callbacks. |
| Persist the post-animation board projection | Animation must not alter the recoverable game state; refresh and tab-hide now restore the logically returned tiles. |
| Use distinct sheet overrides for result and solved-words overlays | The two overlays intentionally had different backdrops before the refactor. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Initial production build failed in the sandbox because Turbopack attempted to listen on loopback | The same command passed outside the sandbox after approval. |
| Review found a missing completed-stage star display, a hard-coded word total, incomplete sheet visual parity, and remaining round responsibility overlap | Apply narrowly scoped presentation/action extractions while preserving the hook contract. |

## Resources
- `src/games/stackdown/use-stackdown.ts`
- `src/games/stackdown/stackdown.css`
- `scripts/test-stackdown.ts`, `scripts/test-stackdown-sync.ts`
