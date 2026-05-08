# PR_26128_001 Rollback Preserved Items

## Preserved Baseline
- Preserved the committed Workspace Manager V2 accordion behavior in `tools/workspace-manager-v2/js/controls/AccordionSection.js`.
- Preserved committed Workspace Manager V2 layout and non-runtime UI consistency updates in `tools/workspace-manager-v2/index.html` and `tools/workspace-manager-v2/styles/workspaceManagerV2.css`.
- Preserved the committed Preview Generator V2 baseline where Workspace Manager launches hydrate from session context and tools-mode repo picking remains local to Preview Generator V2.
- Preserved existing schema files exactly; no `tools/schemas/**` files were changed by this rollback.
- Preserved sample JSON exactly; no `games/**`, `samples/**`, or sample manifest JSON files were changed by this rollback.
- Preserved roadmap content exactly; no roadmap files were changed by this rollback.

## Session Inspector Note
- `tools/session-inspector/**` is not present in this checkout after rollback, and no files under that path were available to preserve or modify.
