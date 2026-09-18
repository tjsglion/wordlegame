# Task Plan: Stackdown tile feedback

## Goal
Make Stackdown selections visibly travel from the stack to answer slots, and make invalid five-letter guesses shake before letters return in sequence.

## Current Phase
Phase 10 complete

## Phases

### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify constraints
- [x] Document in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define approach
- [x] Identify component and hook boundaries
- **Status:** complete

### Phase 3: Implementation
- [x] Add a measured temporary tile-flight layer for selections and returns
- [x] Gate invalid-guess restoration until the visual return completes
- [x] Preserve keyboard controls and reduced-motion behavior
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify requirements met
- [x] Document test results
- **Status:** complete

### Phase 5: Delivery
- [x] Review outputs
- [x] Deliver to user
- **Status:** complete

### Phase 6: Motion smoothness follow-up
- [x] Reproduce the reported single-return interaction in a browser
- [x] Inspect the invalid-return scheduling path
- [x] Replace direct single-return state mutation with the shared flight path
- [x] Batch invalid-return visual work and commit the logical return once
- [x] Re-run interaction and automated verification
- **Status:** complete

### Phase 7: Tile-layer continuity follow-up
- [x] Keep a picked flight tile in the visual cover calculation until it reaches its answer slot
- [x] Give every returning flight its original board depth
- [x] Return a rejected word in reverse pick order, matching stack reconstruction
- [x] Synchronize each slot letter's departure with its own return flight
- [x] Re-run lint, typecheck, Stackdown tests, sync tests, diff check, and production build
- **Status:** complete

### Phase 8: Final-pick sequencing follow-up
- [x] Add a red-capable timing regression check for fifth-pick validation
- [x] Delay validation until the final pick's flight duration has elapsed
- [x] Lock hint and slot-removal actions during the short final-pick settling state
- [x] Preserve immediate validation for reduced-motion users
- [x] Re-run Stackdown tests, lint, typecheck, sync tests, diff check, and production build
- **Status:** complete

### Phase 9: Reference-aligned pick lifecycle
- [x] Diagnose the current visual/logical state race
- [x] Stage the source tile, flight clone, and destination slot as one lifecycle
- [x] Commit the selected slot only on the browser animation completion signal
- [x] Preserve input locking, reduced-motion behavior, final-pick validation, and return paths
- [x] Add lifecycle regression coverage and verify the production build
- **Status:** complete

### Phase 10: Hint-control layout stability
- [x] Reproduce and identify the layout-footprint mismatch
- [x] Make collapsed and expanded hint states occupy the same flow height and spacing
- [x] Add a regression check and re-run targeted validation
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use a fixed-position flight clone | It keeps puzzle state, persistence, and server validation unchanged while preserving a continuous visual path. |
| Let the UI acknowledge invalid-guess completion | The hook can keep tiles absent until the shake and staggered return have actually completed. |
| Respect `prefers-reduced-motion` | Users who opt out get immediate state changes without long animation delays. |
| Retain the flying pick in visual coverage | A clone is still physically over the board during its flight, so the lower tile should not brighten before the clone leaves. |
| Rebuild rejected picks in reverse order | The last selected tile may be below an earlier selected tile; landing it first prevents a temporary covered-face flash. |
| Treat the final pick as a settling state | A network response can arrive before the final flight ends, so validation must be held until the physical action has landed. |
| Use `animationend` as the lifecycle boundary | Browser-rendered animation completion is more reliable than a parallel nominal-duration timer and prevents the board, clone, and slot from racing each other. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Initial plan patch did not match the short generated template | Re-read the generated files and applied a targeted patch. |
| ESLint rejected synchronous state clearing inside the wrong-return effect | Move the cleanup to the explicit completion path so the effect only coordinates timers and DOM motion. |
| A later sandboxed `next typegen` attempt failed to listen on `127.0.0.1` with `EPERM` | Re-run the prescribed typecheck with the required sandbox escalation; the earlier typecheck and production build had passed. |
| Sandboxed Stackdown tests failed to create the tsx IPC pipe with `EPERM` | Re-run the unchanged prescribed tests with required sandbox escalation. |
| User reported rough return interactions after initial delivery | Browser reproduction and source tracing found a direct state-only single-return path and per-tile JavaScript state work in the invalid-return path. |
