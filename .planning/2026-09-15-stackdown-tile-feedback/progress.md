# Progress Log

## Session: 2026-09-15

### Current Status
- **Phase:** 8 - Final-pick sequencing follow-up complete
- **Started:** 2026-09-15

### Actions Taken
- Reviewed the Stackdown board, slots, hook lifecycle, CSS, existing Stackdown tests, and the relevant Next.js client-component guide.
- Inspected the reference game's public assets after computer-use browser access was unavailable.
- Presented the M-class feature brief and received explicit approval to implement.
- Chose an ephemeral DOM flight layer and an explicit UI completion callback for wrong guesses.
- Implemented the first motion-layer pass; TypeScript verification passed.
- Fixed the lint finding by clearing return-specific presentation state from the next interaction rather than synchronously inside an effect.
- Completed lint, typecheck, Stackdown route/puzzle tests, Stackdown sync tests, diff whitespace validation, and a production build.
- Attempted runtime-page validation. No computer-use browser was available, and the existing development-process metadata did not correspond to a listening localhost port; this remains the only unverified visual step.
- Reopened the existing local Stackdown page in a separate Chrome tab. The page responded and a selected tile entered an answer slot. Source and UI reproduction confirmed individual answer-slot removal bypasses the flight layer.
- Replaced direct `unpick` restoration with the shared return request/acknowledgement path. Replaced invalid-return per-tile React timer work with one CSS-delayed set of flight clones and one logical pile restoration after the final handoff.
- Re-ran lint, typecheck, both Stackdown test suites, the production build, and whitespace validation successfully.
- Added a visual-exposure calculation that treats a currently flying picked tile as a temporary cover, so uncovering is shown only when the clone has completed its movement.
- Changed rejected-word returns to rebuild the physical stack from the last selected tile back to the first, preserving tile depth throughout the return.
- Synchronized the source answer-slot letter hiding with each individual return-flight delay, eliminating the static dark/covered face competing with its flight clone.
- Re-ran lint, typecheck, Stackdown route/puzzle tests, Stackdown sync tests, diff whitespace validation, and a production build successfully after the layer-continuity change.
- Added a timing regression check which initially failed because no final-pick submission delay existed.
- Added an explicit final-pick settling state. The fifth tile now completes its 480ms flight plus one paint frame before validation can begin, and hint/removal actions are locked during that handoff.
- Kept reduced-motion behavior immediate because no flight is rendered in that mode.
- Re-ran Stackdown route/puzzle tests, lint, typecheck, Stackdown sync tests, diff whitespace validation, and the production build successfully.

### Test Results
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| `npm run lint` | No lint errors | Passed | pass |
| `npm run typecheck` | Next type generation and TypeScript succeed | Passed (with sandbox escalation for the local listener) | pass |
| `npm run test:stackdown` | Puzzle and route checks pass | 390 puzzles plus route checks passed | pass |
| `npm run test:stackdown-sync` | Sync checks pass | Passed | pass |
| `git diff --check` | No whitespace errors | Passed | pass |
| `npm run build` | Production build succeeds | Compiled, typechecked, and generated 23 pages | pass |
| Browser interaction | Confirm rendered flight/shake sequence | Blocked: no browser surface; localhost dev port was not listening | not run |
| Local Chrome interaction | Select then remove a Stackdown letter | Slot appeared and the return completed without console/runtime failure | pass |
| Follow-up verification | lint, typecheck, Stackdown tests, build, diff check | All passed | pass |
| Layer-continuity verification | lint, typecheck, Stackdown tests, sync tests, build, diff check | All passed | pass |
| Final-pick timing regression | `npm run test:stackdown` before helper | Fails: `finalPickSubmitDelay is not a function` | red/pass loop established |
| Final-pick verification | Stackdown tests, lint, typecheck, sync tests, build, diff check | All passed | pass |

### Errors
| Error | Resolution |
|-------|------------|
| No interactive browser surface available | Inspected the reference's public HTML/CSS/JS and recorded its observable behavior before design decisions. |
| Initial plan patch did not match the short generated template | Re-read the generated files and will use the corrected structure. |
| ESLint disallowed a synchronous `setReturningTileIds` inside an effect | Resolved by clearing that presentation state from the next pick handler. |
| Sandboxed `next typegen` later failed with `listen EPERM 127.0.0.1` | Passed after required sandbox escalation. |
| Sandboxed Stackdown tests failed to create the tsx IPC pipe | Passed after required sandbox escalation. |
| Local runtime page did not respond on ports 3000 or 3030 | Existing Next development metadata reported a process, but no listener was reachable; production build and all automated checks pass. |
| Sandboxed production build could not bind `127.0.0.1` | Re-ran the unchanged build with the required local-loopback approval; it compiled and generated all 23 pages. |
# 2026-09-16 — Phase 9 started

- User approved reference-aligned Stackdown interaction optimization.
- Diagnosed the current pick lifecycle: measured flight, source removal, destination insertion, and a nominal timer start together in one event, causing perceptible discontinuity.
- Planned a single lifecycle that commits gameplay state on the browser animation completion signal.

# 2026-09-16 — Phase 9 complete

- Replaced nominal pick-flight cleanup with per-clone `animationend` completion.
- Deferred the authoritative pick until its clone lands; the original board tile stays structurally present but visually hidden during travel, avoiding both premature uncovering and duplicate glyphs.
- Locked board, slot, and hint input during a pick flight. Kept reduced-motion picks immediate.
- Changed final-pick validation to wait only for the post-landing paint frame, and changed return completion to the final return clone's actual landing.
- Updated lifecycle regression checks and verified `npm run lint`, `npm run test:stackdown`, `npm run typecheck`, `npm run test:stackdown-sync`, `npm run build`, and `git diff --check`.
- Manually verified the local page: `I` became a visible bottom slot after its flight, then returned to an enabled board tile after slot removal.

# 2026-09-16 — Phase 10 complete

- Reproduced the conditional hint-control replacement and identified the `0.8rem` height difference plus `0.1rem` spacing difference as the document-flow cause.
- Added a red-capable static regression assertion for an equal hint-control footprint; it failed before the CSS change and passes now.
- Matched the collapsed disclosure to the slider's `3.85rem` height and `0.1rem` slot spacing.
- Re-ran `npm run test:stackdown`, `npm run lint`, `npm run typecheck`, and `git diff --check` successfully.
