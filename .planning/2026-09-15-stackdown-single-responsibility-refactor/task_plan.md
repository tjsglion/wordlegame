# Task Plan: Stackdown single-responsibility refactor

## Goal
Decompose the Stackdown game UI into focused client components and an animation controller without changing gameplay, presentation behavior, or the existing game-hook contract.

## Current Phase
Phase 13 complete

## Phases

### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify constraints
- [x] Document in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define focused component boundaries
- [x] Create module structure
- **Status:** complete

### Phase 3: Implementation
- [x] Execute the plan
- [x] Keep the game-hook contract and CSS/translation interfaces intact
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify requirements met
- [x] Document test results
- **Status:** complete

### Phase 5: Delivery
- [x] Review outputs
- [x] Prepare delivery summary
- **Status:** complete

### Phase 6: Review fixes
- [x] Restore the finished-stage star display and hook-derived total
- [x] Restore Stackdown sheet transition/visual overrides within `GameModalShell`
- [x] Extract round actions and stage presentation from the coordinator
- [x] Re-run Stackdown verification
- **Status:** complete

### Phase 7: Readability repair
- [x] Reformat `StackdownRound` into named sections and props
- [x] Split `StackdownStage` into loading, header, finish, and stat subcomponents
- [x] Run lint, type checking, and whitespace validation
- **Status:** complete

### Phase 8: Second-review fixes
- [x] Persist the post-return board projection instead of animation state
- [x] Restore the result sheet's distinct backdrop
- [x] Replace broad stage inputs and compressed JSX with narrow types and named blocks
- [x] Run Stackdown checks and production build
- **Status:** complete

### Phase 9: Hook responsibility refactor
- [x] Reassess `useStackdown` boundaries and preserve its public contract
- [x] Extract timer and client-side state/persistence helpers behind the facade
- [x] Run Stackdown and TypeScript verification
- **Status:** complete

### Phase 10: Review remediation
- [x] Invalidate stale animation and request callbacks across rounds
- [x] Separate storage and motion runtime policy from client model helpers
- [x] Re-run lint, types, and Stackdown checks
- **Status:** complete

### Phase 11: Hook composition completion
- [x] Move tile selection, guess validation, hint requests, and transient feedback into a dedicated interaction hook
- [x] Wire the loader, timer, persistence, and sync modules through `useStackdown`
- [x] Preserve the existing game-facing hook API and validate the Stackdown suites
- **Status:** complete

### Phase 12: Review remediation
- [x] Preserve daily sync timestamps in the local storage payload
- [x] Cancel transient return work before applying a merged cloud round
- [x] Restore the public status type export and cancel delayed work on unmount
- [x] Extract stats calculation and storage clearing from interaction effects
- [x] Add pure-model regression coverage and re-run repository checks
- **Status:** complete

### Phase 13: Sync convergence remediation
- [x] Include the daily sync timestamp in the client projection guard
- [x] Move desync storage cleanup from interactions to the composition root
- [x] Add a same-progress/newer-version sync regression assertion
- [x] Re-run Stackdown and repository verification
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Preserve `useStackdown` as the authoritative gameplay boundary | The requested change is structural; game state, persistence, and sync behavior must not move or change. |
| Keep all extracted components client-side | They require event handlers, effects, refs, browser APIs, and/or client translations. |
| Keep `useStackdown` as a facade | Its callers use `ReturnType<typeof useStackdown>`; extracting internals behind the same facade avoids a UI-contract migration. |
| Reuse `GameModalShell` for both overlays | Repository UI rules require its single modal architecture. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Malformed plan-ID inspection command after initializing the isolated plan | No project files were affected; used the known plan path directly. |
| Sandboxed production build could not bind `127.0.0.1` | Re-ran the unchanged `npm run build` command with user-approved escalation; it passed. |
