# BUILD_PR_11_278_WORKSPACE_V2_WORKSPACE_SCHEMA_EXPORT_ENFORCEMENT_AND_SAME_TOOL_DIFF_GUARD

## Purpose
Implement workspace.schema-based Workspace V2 export/import enforcement and same-tool-only diff guard.

## Files
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tools/schemas/workspace.schema.json
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/dev/reports/PR_11_278_workspace_schema_export_enforcement_and_same_tool_diff_guard_report.md

## Implementation
1. Replace Workspace V2 export document builder to emit workspace schema root shape:
   - `documentKind`, `schema`, `version`, `games`
2. Remove custom wrapper contract from Workspace V2 export/import:
   - no `workspaceV2Session`
   - no `toolSessions`
   - no `savedSessions`
   - no `exportedAt`
3. Add minimal workspace schema support for Workspace V2 session payload carriage inside `games[].session` (no broad schema rewrite).
4. Validate workspace export/import payloads against workspace schema rules in Workspace V2 runtime validator before export download/import apply.
5. Reject wrapper/non-schema payloads with actionable error text naming `tools/schemas/workspace.schema.json`.
6. Add same-tool diff guard:
   - disable `Compute Diff` when `Session A toolId !== Session B toolId`
   - show exact message: `Diff requires sessions from the same tool.`
7. Keep tool/workspace separation unchanged (Workspace V2 workspace controls only; tool pages no workspace controls).

## Acceptance
- Workspace V2 export root validates as workspace schema document shape.
- Export/import rejects wrapper payloads and non-schema payloads.
- Diff cannot run across different tool IDs and shows required message.
- Same-tool diff behavior remains unchanged.

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2SessionMerge.test.mjs`
