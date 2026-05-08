# PR_26128_003 Rollback Preserved Items

## Preserved Baseline
- Preserved Workspace Manager V2 accordion behavior; existing accordion validation remains in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
- Preserved rename/move cleanup and cosmetic/layout-only UI consistency work outside the unstable direct-write path.
- Preserved Workspace Manager V2 sessionStorage launch context for first-class tools.
- Preserved Preview Generator V2 tools-mode repo picking as local Preview Generator behavior.
- Preserved existing schema files exactly; no `tools/schemas/**` files were changed.
- Preserved sample JSON exactly; no `games/**`, `samples/**`, or sample manifest JSON files were changed.
- Preserved roadmap content exactly; no roadmap files were changed.

## Session Inspector Note
- `tools/session-inspector/**` is present as actual tool/runtime files and was preserved unchanged in this rollback.
