# PR_11_276 Workspace V2 Nav Mode Separation + Workspace Export Contract Report

## Scope
Workspace V2 only:
- import/export controls
- tool-vs-workspace nav mode separation
- workspace export/import contract alignment

## Files Changed
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/pr/PLAN_PR_11_276_WORKSPACE_V2_NAV_MODE_SEPARATION_AND_EXPORT_CONTRACT_CORRECTION.md
- docs/pr/BUILD_PR_11_276_WORKSPACE_V2_NAV_MODE_SEPARATION_AND_EXPORT_CONTRACT_CORRECTION.md
- docs/dev/reports/PR_11_276_workspace_v2_nav_mode_and_export_contract_report.md

## Implementation Summary
- Added explicit nav mode selector:
  - `Tool Mode (navTools)`
  - `Workspace Mode (navWorkspace)`
- Split UI actions by mode:
  - navTools: tool session import/export only
  - navWorkspace: workspace session import/export only
- Added mode-gated handler checks so actions cannot run from the wrong mode.
- Tool mode export (`exportCurrentSessionJson`) now exports only the active tool payload JSON.
- Workspace mode export (`exportWorkspaceSessionJson`) now exports portable workspace container contract:
  - `version`, `toolId: workspace-v2`
  - `workspaceSession` with workspace identity, default/active tool, active host context, `toolSessions` grouped by toolId/sessionId, and `savedSessions`
- Removed runtime-only fields from workspace export payload contract:
  - `sessionHistory`
  - `sessionSelection`
  - `mergeAuditLog`
  - lone `activeSessionPayload`
- Added workspace import (`importWorkspaceSessionJson`) with contract validation and state hydration for active session + saved sessions.

## Workspace Contract Alignment Notes
- Existing repo schemas under `tools/schemas/workspace*.json` are workspace/game manifest contracts for legacy tool ids and are not directly compatible with Workspace V2 tool-session lane.
- This PR keeps schema files untouched and enforces a Workspace V2 portable session wrapper contract in code/tests.
- No schema file correction was required for this scoped Workspace V2 runtime/export lane.

## Validation Commands
1. `node --check tools/workspace-v2/index.js`
   - PASS
2. `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
   - PASS
3. `node tests/runtime/V2CurrentSessionExport.test.mjs`
   - PASS
   - Results: `tmp/v2-current-session-export-results.json`

## Full Samples Smoke Decision
- Skipped full samples smoke test.
- Reason: changes are confined to Workspace V2 import/export/nav-mode logic and validated with targeted runtime checks.
