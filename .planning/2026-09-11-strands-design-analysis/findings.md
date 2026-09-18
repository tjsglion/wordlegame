# Findings: Strands Requirements and Design

## Requirements
- The user requested a thorough analysis of `docs/strands-game-design copy 2.md`, task extraction and decomposition, then implementation according to the document.
- The user explicitly requires that requirements are fully understood before execution.
- This session is limited to requirements analysis and a design document; no application implementation begins until the design is reviewed.

## Research Findings
- The app uses Next.js 16.3 App Router, React 19, next-intl, Tailwind 4, OpenNext/Cloudflare Workers, Turso/libSQL, and Drizzle.
- New games are self-contained folders under `src/games/<slug>/`, registered through `src/games/registry.ts` and `GameSlug` in `src/lib/game/types.ts`.
- The canonical public route is `/<locale>/<slug>` through `src/app/[locale]/[slug]/page.tsx`; routes are locale-prefixed.
- Browser persistence is SSR-safe through `src/lib/game/storage.ts`; existing Wordle and Stackdown folders establish the expected game module pattern.
- Existing verification uses executable `tsx` scripts plus `npm run check`; there is no browser test framework.
- Production infrastructure has no Strands tables, common multi-length dictionary, vector search, embedding client, or general resilient LLM pipeline.
- The Golden Fixture has multiple legal routes per word. The client accepts them, including the documented possibility that a player locks out a later word; fixture win tests must use supplied disjoint coverage paths.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Fixture-backed client MVP first | It validates gameplay fidelity before production dependencies are ready. |
| Maintain final StrandsPuzzleData contract in fixture data | Replacing fixtures with database data will not rewrite gameplay logic. |
| Treat topic and player theme as separate values | The specification deliberately uses topic for generation de-duplication and theme as the player-facing clue. |
| Preserve deliberate validation asymmetry | Theme/spangram accepts reverse paths; validWords remains forward-only. |
| Keep generator constraints out of client validation | Generator uniqueness/no-crossing rules do not govern legal player paths. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `next-env.d.ts` is dirty before the Strands work | Leave it untouched and exclude it from this work. |
| DDL lacks `is_common_word` but valid-word DFS references it | Decide whether to add a tier field or pre-filter the dictionary during production implementation. |
| Score API has no durable idempotency key | Treat it as best-effort until a score event identifier/unique policy is designed. |

## Phase 2 Puzzle Service Decisions
- User selected anonymous completion reporting. The server will require an anonymous ID and use the unique tuple `(date, puzzle_id, anonymous_id)` for retry-safe insertion.
- Score submission is completion-only and validates the requested puzzle against the authoritative daily assignment before recording it.
- The first backend delivery is limited to inventory tables, daily lookup, score reporting, and repeatable Golden Fixture seeding. Generator, cron, dictionary, and LLM work are deferred.
- Next.js 16 route handlers are defined in `route.ts`, use standard Request/Response APIs, and POST handlers are not cached by default.

## Delivered Puzzle Service
- Added `strands_puzzles`, `daily_strands`, `strands_scores`, and `common_dictionary` to Drizzle schema, with generated snapshot plus append-only `0006_dusty_butterfly.sql` migration.
- The unique database index on `(date, puzzle_id, anonymous_id)` provides retry-safe anonymous score insertion.
- `src/games/strands/server.ts` maps stored JSON into the existing client contract and rejects malformed or invariant-violating rows.
- `GameRoutePage` passes the assigned daily puzzle to the client only when one exists; existing fixture behavior remains available prior to seeding.
- `POST /api/strands/scores` validates the payload and authoritative daily assignment before inserting completion telemetry.
- `npm run db:seed:strands [YYYY-MM-DD]` seeds the Golden Fixture and assigned daily date using the runtime HTTP/libSQL database endpoint.

## Resources
- `docs/strands-game-design copy 2.md`
- `src/games/registry.ts`
- `src/lib/game/types.ts`
- `src/lib/game/storage.ts`
- `src/lib/drizzle/schema.ts`
- `worker.js`
