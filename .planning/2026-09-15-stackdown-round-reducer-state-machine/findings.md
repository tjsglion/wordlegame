# Findings: Stackdown round reducer state machine

## Known Facts
- `useStackdown` currently coordinates many independent state values and mirrored refs for timer, persistence, and sync snapshots.
- The recent extraction isolated loading, timer, persistence, sync, and interaction effects, but action boundaries still pass a large set of state values and setters between modules.
- Animation and network callbacks require generation invalidation so stale work cannot overwrite a new round or synced projection.

## Design Direction
- Use a local `useReducer` state machine inside the Stackdown facade rather than a global store.
- Keep reducer actions synchronous and serializable; adapters perform fetch/timer/storage work and dispatch resolved outcomes.
- Retain refs only where an effect needs the newest state without resubscribing; derive or minimize them after the reducer design is complete.

## Open Decisions
- Whether transient animation state belongs in the reducer or in the tile-flight hook. Recommendation: keep logical return/final-pick state in the reducer and DOM flight geometry in the animation hook.
- Whether sync application receives a complete round snapshot action or a specialized projection action. Recommendation: use a single validated `SYNC_APPLIED` action to guarantee atomic replacement.
