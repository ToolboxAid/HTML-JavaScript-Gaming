# PLAN_PR_11_277_WORKSPACE_V2_MANIFEST_ONLY_EXPORT_ENFORCEMENT

## Purpose
Enforce manifest-only Workspace V2 export/import so exported JSON is workspace manifest root shape, not a custom wrapper.

## Scope
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tools/schemas/workspace.manifest.schema.json (minimal Workspace V2 session field support only)
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/dev/reports/PR_11_277_workspace_v2_manifest_only_export_enforcement_report.md

## Goals
- Export root shape is workspace manifest (`documentKind/schema/version/id/name/tools`).
- No `workspaceSession` wrapper export.
- Workspace V2 session persistence lives in manifest-allowed field(s) only.
- Export path validates manifest contract before download and blocks with actionable error when invalid.
- Import accepts manifest-root shape and restores Workspace V2 tool sessions/saved sessions.
- Save/Load/Diff/Merge flows remain intact (no behavioral rewrites).

## Out Of Scope
- No tool schema changes.
- No non-Workspace-V2 behavior changes.
- No platformShell/tools/shared rewiring.

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
