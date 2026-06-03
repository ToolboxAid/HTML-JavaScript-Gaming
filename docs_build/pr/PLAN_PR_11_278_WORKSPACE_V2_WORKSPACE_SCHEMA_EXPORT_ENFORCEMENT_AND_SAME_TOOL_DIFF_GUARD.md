# PLAN_PR_11_278_WORKSPACE_V2_WORKSPACE_SCHEMA_EXPORT_ENFORCEMENT_AND_SAME_TOOL_DIFF_GUARD

## Purpose
Enforce Workspace V2 workspace export/import against `tools/schemas/workspace.schema.json` and block cross-tool session diff comparisons.

## Scope
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tools/schemas/workspace.schema.json (smallest required addition only)
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/dev/reports/PR_11_278_workspace_schema_export_enforcement_and_same_tool_diff_guard_report.md

## Goals
- Workspace V2 export/import validates and uses `workspace.schema.json` shape.
- Export removes `workspaceV2Session`, `toolSessions`, `savedSessions`, and `exportedAt` wrappers.
- Import rejects payloads that do not match workspace schema contract.
- Diff Viewer disables cross-tool comparisons and shows exact message:
  - `Diff requires sessions from the same tool.`
- No nav mode overlap introduced.

## Out Of Scope
- No tool schema changes.
- No unrelated Workspace V2 features.
- No cross-tool implementation edits.

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2SessionMerge.test.mjs`
