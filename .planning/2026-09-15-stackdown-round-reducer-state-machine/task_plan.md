# Task Plan: Stackdown round reducer state machine

## Goal
Replace the implicit collection of Stackdown round state setters and mirrored refs with a reducer-backed state machine, while preserving gameplay behavior and the public `useStackdown` API.

## Current Phase
Phase 1 - Discovery

## Scope
- Model round lifecycle, tile selection, return animation, final-pick settling, guess resolution, hint resolution, loading, and synced-state application as explicit reducer actions.
- Keep browser effects outside the reducer: timers, fetch, local storage, sound, haptics, and cloud sync remain effect/adapter responsibilities.
- Preserve daily save shape, sync merge semantics, UI animation contracts, and all current `useStackdown` return fields.

## Exclusions
- No game-rule, API, persistence-schema, translation, visual, or modal-system changes.
- No migration to a global store or React context unless discovery proves the local reducer boundary is insufficient.

## Acceptance Scenarios
- Loading or restoring a round atomically replaces round state without stale animation state.
- A returned tile, final-pick validation, success flash, invalid-word return, and hint request transition through named reducer actions.
- A synced daily round cancels incompatible transient interaction state before applying the remote projection.
- Existing `StackdownRound`, stage, animation, persistence, and sync consumers retain their current public hook contract.

## Verification Plan
- Add reducer transition tests for load/restore, pick/unpick, return completion, correct/incorrect guess, hint resolution, desync reload, and synced-state application.
- Run `npm run test:stackdown`, `npm run test:stackdown-sync`, `npm run lint`, `npm run typecheck`, and `git diff --check`.

## Status
- [x] Optimization item created
- [ ] Reducer state/action design approved
- [ ] Implementation
- [ ] Verification
