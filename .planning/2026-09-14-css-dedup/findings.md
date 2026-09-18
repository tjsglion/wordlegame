# Findings & Decisions

## Requirements
- Optimize `src/app/globals.css` according to the previously recommended approach.
- Maintain visual appearance and interaction behavior.

## Research Findings
- The file has 2,243 lines and contains global tokens plus Wordle, Strands, Stackdown, and Stackdown help-demo rules.
- `wordle-pop`/`sd-pop` and `wordle-shake`/`sd-shake` keyframes are exact duplicates.
- `.sdh-*` selectors are consumed only by the Stackdown help demos; they resemble `.sd-*` rules but differ in compact geometry and static-demo behavior.
- Next.js 16 supports global CSS imported by the root layout; feature styles can remain globally named while being placed in imported files.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use imported global feature stylesheets | Separates ownership without changing component class names. |
| Use `game-pop` and `game-shake` shared animations | Removes exact duplication with a clear cross-game name. |
| Share only identical Stackdown/help layout primitives | Avoid risky abstraction of visually distinct sizes and animations. |
| Retain global class names in imported feature sheets | A CSS Module migration would add a large, unnecessary component API migration to an organization-only refactor. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
