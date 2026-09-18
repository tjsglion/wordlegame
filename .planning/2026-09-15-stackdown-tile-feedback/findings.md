# Findings & Decisions

## Requirements
- Improve Stackdown letter-pick feedback and invalid-guess feedback by borrowing observable interaction principles from Puzzlist Stackdown.

## Research Findings
- Puzzlist moves a selected tile into its answer position with a 0.5 s custom drop easing.
- Its invalid state shakes the five answer wells for about 0.75 s with horizontal displacement and a slight Y-axis rotation, then returns selected tiles one at a time.
- Our board removes the tile from `presentIds` immediately; answer slots currently mount immediately and only use `game-pop`. Invalid guesses immediately call `returnSlots` while applying the smaller shared `game-shake` effect.
- `stackdown-game.tsx` owns the interactive client component and can measure board/slot DOM; `use-stackdown.ts` owns local progression and the server guess lifecycle.
- Browser reproduction on `http://localhost:3000/en/stackdown` confirmed a selected tile reaches an answer slot. Source tracing confirms single-return calls `returnSlots` immediately and does not create a flight clone, matching the user's reported discontinuity.
- The invalid-return path schedules five independent timer callbacks. Each callback creates a React state update for hidden-slot bookkeeping and another for the flight clone; the logical pile restoration is scheduled exactly at the last clone's nominal duration. This is a credible source of visible cadence mismatch, but direct frame capture is not available through the accessibility harness.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Ephemeral measured flight layer | `StackdownRound` can measure source and target rectangles without altering authoritative presence or saved progress. |
| Explicit wrong-return completion | `useStackdown` can defer `returnSlots` until the visible sequence completes. |
| Route all returns through a shared timeline | The original board element must stay absent until its associated flight finishes, whether one tile or five tiles are returning. |
| Use CSS animation delays for the five-tile return | One render starts the sequence, avoiding five staggered React rendering/timer starts. |
| Correct diagnosis: state-only and per-tile timer returns | Manual return had no flight path, while invalid return did repeated React work and restored the board at the visual boundary. The replacement batches flight creation and restores authoritative state after a 32 ms visual handoff. |

## Phase 9 findings
- The current pick callback queues a flight clone and calls the authoritative `onPick` synchronously in the same event. This removes the source tile, creates the destination slot, and starts the clone in one React commit.
- Flight cleanup uses a nominal-duration `setTimeout`, so the authoritative state transition is not tied to the browser's actual animation completion.
- The destination slot is hidden from the same `flights` state that controls the clone. This masks duplicate glyphs but does not establish an explicit source → flight → destination lifecycle.
- The next iteration should keep the authoritative board state stable until a flight's `animationend`, then commit `onPick`. This is the smallest compatible approach because API validation and persistence already consume only committed slots.

## Phase 9 outcome
- `StackdownTileFlights` now reports each clone's own `animationend`; it no longer removes flights with a nominal-duration timeout.
- A pick keeps the selected source tile in `presentIds` and hides only its source face. The clone is therefore the single visible glyph during travel; `onPick` runs only when that clone lands, at which point the static bottom-slot letter mounts.
- `isPickPending` locks board picks, slot removal, and hint interactions while that lifecycle is active, removing double-input races.
- Return completion uses the actual landing event of the final staggered return tile, rather than a separate timeout.
- In the local Stackdown page, selecting `I` temporarily locked the board, then exposed a visible `Remove I` slot only after the flight; removing it restored a selectable `Pick I` tile. No blank destination slot was observed.

## Phase 10 findings
- The collapsed `Need a hint?` button had a `3.15rem` minimum height and no slot-to-control margin, while its replacement slider had a `3.85rem` height plus `0.1rem` margin. The conditional replacement therefore grew the centred stage by `0.8rem` on every first open.
- Matching the disclosure to `3.85rem` and giving it the same `0.1rem` spacing eliminates the flow-height delta without changing hint semantics or focus behavior.
- A short automated-browser viewport scrolls an off-screen button into view before clicking it; that screenshot scroll is tool-induced and distinct from the layout movement reproduced by the CSS footprint mismatch.

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Local computer-use browser unavailable | Inspected the reference site's public HTML, CSS, and JavaScript; no third-party code will be copied. |

## Resources
- https://puzzlist.com/stackdown/ (public reference behavior)
- `src/games/stackdown/stackdown-game.tsx`
- `src/games/stackdown/use-stackdown.ts`
- `src/games/stackdown/stackdown.css`
