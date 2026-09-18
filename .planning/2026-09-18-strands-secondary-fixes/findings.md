# Findings & Decisions

## Requirements
- User asked to implement every secondary issue identified in the Strands audit.
- Included: solution integrity and hint lookup, scalable practice selection, share feedback, and tests.
- Excluded: restoring remote scores, which needs server-owned completion sessions.

## Research Findings
- Current validation checks only shape and aggregate letter count; it does not prove each answer is traceable on the stored board.
- Current hint lookup performs a fresh DFS per candidate.
- Generated boards already have non-overlapping canonical paths in `generateStrandsGrid`, but those paths are discarded before persistence.
- Practice currently uses SQLite `ORDER BY RANDOM()`, which becomes a full scan as inventory grows.
- Share has no success/failure feedback and propagates native-share cancellation as an unhandled rejection.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Persist canonical paths only in memory from the board | Avoids a migration while giving the client deterministic, constant-time hint lookup. |
| Treat native share cancellation as a neutral result | A user closing the platform share sheet is not an error. |
| Use an indexed UUID pivot for practice selection | It avoids `ORDER BY RANDOM()` sorting the entire inventory; the empty upper range wraps to the first ID. |
| Replace UUID pivot with SQLite rowid pivot | Legacy non-UUID IDs would otherwise make practice selection biased. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|

## Resources
-
