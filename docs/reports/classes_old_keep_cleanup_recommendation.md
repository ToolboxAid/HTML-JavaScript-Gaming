# legacy class-retention policy marker Cleanup Recommendation

Generated: 2026-04-12
Recommendation type: follow-up execution guidance

## Recommended Path
Keep placeholder now; plan optional removal later in a dedicated docs-only lane.

## Immediate Recommendation (Current PR)
- Preserve normalized terminology:
  - `legacy class-retention policy marker`
- Do not remove references in this lane.

## Future Removal Readiness Criteria
Run a dedicated retirement lane only when all are true:
1. Roadmap, cleanup inventory, cleanup matrix, enforcement map, and normalization report can be updated together.
2. PR/build specs referencing `legacy class-retention policy marker` can be updated in one synchronized docs pass.
3. Command/report metadata references are either intentionally retained or updated with explicit rationale.
4. Validation confirms:
   - no `legacy class-retention policy marker` directory on disk,
   - no runtime/code references,
   - no collateral changes to `templates/`, `docs/archive/`, or SpriteEditor archive surfaces.

## Recommended Future Lane Shape
- docs-only
- no runtime edits
- no file/folder structural operations
- include explicit before/after reference inventory and rollback notes

## Risk Note
Removing references prematurely can erase audit context for legacy-cleanup decisions; retaining a clearly labeled placeholder is lower risk until final retirement scope is approved.

