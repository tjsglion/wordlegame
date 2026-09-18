# Task Plan: Global CSS Deduplication

## Goal
Reduce genuine global-style duplication and separate game-owned styles without changing rendered game behavior; keep `globals.css` to shared theme and base rules.

## Current Phase
Phase 6

## Phases

### Phase 1: Discovery and scope
- [x] Audit `src/app/globals.css` and class consumers.
- [x] Identify exact duplicate animations and Stackdown/help visual overlap.
- [x] Preserve existing selector contracts and theme token scopes.
- **Status:** complete

### Phase 2: Refactor design
- [x] Keep global tokens/base rules in `globals.css`.
- [x] Move Wordle, Strands, and Stackdown feature rules into imported global sheets.
- [x] Replace duplicate pop/shake keyframes with shared game animations.
- **Status:** complete

### Phase 3: Implementation
- [x] Extract the shared feedback animations and update animation class consumers.
- [x] Consolidate safe Stackdown/help shared declarations.
- **Status:** complete

### Phase 4: Verification
- [x] Run whitespace, type, lint, and affected game tests.
- [x] Review the final diff for unintended visual or selector changes.
- **Status:** complete

### Phase 5: Delivery
- [x] Report scope, evidence, and deferred consolidation opportunities.
- **Status:** complete

### Phase 6: Feature-style extraction
- [x] Define import order and file ownership without changing selectors.
- [x] Extract Wordle, Strands, Stackdown, and site-shell styles from `globals.css`.
- [x] Verify the compact root stylesheet and production stylesheet compilation.
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Keep scoped theme-token overrides | They define intentional visual worlds, rather than accidental duplicate declarations. |
| Preserve global class names | Avoids behavior and DOM churn across game and help components. |
| Do not merge every `.sd-*` and `.sdh-*` declaration | They are related but intentionally use distinct geometry and interaction behavior; forcing one selector would obscure the design. |
| Import feature-owned global sheets from the root stylesheet | Keeps global class contracts and cascade order while making source ownership explicit. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
