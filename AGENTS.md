<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project UI Rules

## Modal / Overlay System

- For any new modal, dialog, overlay, result panel, help popup, login popup, or drawer in this project, always reuse `src/components/game/game-modal-shell.tsx`.
- Do not create a second modal system with a new `createPortal`, custom overlay wrapper, or ad-hoc focus-trap implementation in feature code.
- Choose the existing `GameModalShell` variant that matches the use case:
  - `page`: full-height help, leaderboard, or document-style overlays
  - `sheet`: result panels, progress panels, and action-oriented overlays
  - `compact`: small centered dialogs
  - `drawer`: side menu or drawer-style overlays
- If a new overlay needs behavior not covered yet, extend `GameModalShell` first, then reuse it from the feature.
- Do not reintroduce `src/components/ui/dialog.tsx` or a parallel dialog abstraction unless the project explicitly changes its modal architecture.
