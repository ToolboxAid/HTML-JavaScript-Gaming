# PR_11_278 Workspace V2 workspace.schema Export Enforcement + Same-Tool Diff Guard Report

## Scope
Workspace V2 export/import validation and Session Diff Viewer same-tool guard only.

## Files Changed
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tools/schemas/workspace.schema.json
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/pr/PLAN_PR_11_278_WORKSPACE_V2_WORKSPACE_SCHEMA_EXPORT_ENFORCEMENT_AND_SAME_TOOL_DIFF_GUARD.md
- docs_build/pr/BUILD_PR_11_278_WORKSPACE_V2_WORKSPACE_SCHEMA_EXPORT_ENFORCEMENT_AND_SAME_TOOL_DIFF_GUARD.md
- docs_build/dev/reports/PR_11_278_workspace_schema_export_enforcement_and_same_tool_diff_guard_report.md

## Implementation Summary
- Workspace V2 export now emits workspace schema root shape (`documentKind`, `schema`, `version`, `games`) and no custom wrapper.
- Workspace V2 import/export validator now enforces workspace schema contract and rejects wrapper payloads.
- Export/import contract explicitly blocks:
  - `workspaceV2Session`
  - `toolSessions`
  - `savedSessions`
  - `exportedAt`
- Added the smallest workspace schema support needed for Workspace V2 session persistence by adding `games[].session`.
- Diff Viewer now enforces same-tool comparisons only.
  - Cross-tool selections disable diff and show exact message:
    `Diff requires sessions from the same tool.`

## Validation Commands Run
1. `node --check tools/workspace-v2/index.js`
   - PASS
2. `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
   - PASS
3. `node tests/runtime/V2CurrentSessionExport.test.mjs`
   - PASS
   - Results: `tmp/v2-current-session-export-results.json`
4. `node tests/runtime/V2SessionMerge.test.mjs`
   - PASS
   - Results: `tmp/v2-session-merge-results.json`

## Behavior Evidence
- Export root shape now follows `tools/schemas/workspace.schema.json` and no longer includes `workspaceV2Session/toolSessions/savedSessions` wrappers.
- Import rejects non-workspace.schema payloads with actionable error text referencing schema contract.
- Cross-tool diff is blocked before compute and uses required message text.
- Same-tool diff flow remains enabled.

## Full Samples Smoke Decision
- Skipped full samples smoke test.
- Reason: changes are limited to Workspace V2 export/import contract enforcement and diff guard logic; targeted runtime checks cover changed behavior.
