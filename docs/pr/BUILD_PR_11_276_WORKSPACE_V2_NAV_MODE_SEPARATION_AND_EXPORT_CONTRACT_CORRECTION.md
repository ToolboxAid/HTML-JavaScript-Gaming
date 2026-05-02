# BUILD_PR_11_276_WORKSPACE_V2_NAV_MODE_SEPARATION_AND_EXPORT_CONTRACT_CORRECTION

## Purpose
Implement Workspace V2 nav mode separation for import/export controls and align workspace export/import with a portable workspace-level session contract.

## Files
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/dev/reports/PR_11_276_workspace_v2_nav_mode_and_export_contract_report.md

## Implementation
1. Add navigation mode selector in Workspace V2:
   - `tools` (navTools)
   - `workspace` (navWorkspace)
2. Split Import/Export UI into mode-owned action groups:
   - navTools section keeps single-tool import/export controls
   - navWorkspace section adds workspace import/export controls
3. Wire mode rendering in JS with explicit show/hide behavior.
4. Enforce mode-gated actions:
   - tool import/export blocked outside tool mode
   - workspace import/export blocked outside workspace mode
5. Tool mode export remains tool-payload scoped.
6. Workspace mode export outputs portable workspace wrapper containing:
   - workspace identity/version
   - active/default tool identity
   - included tool payloads grouped by `toolId` and `sessionId`
   - saved session map
   - excludes runtime-only fields (`sessionHistory`, `sessionSelection`, `mergeAuditLog`, lone `activeSessionPayload`)
7. Workspace import validates workspace wrapper contract and restores active session + saved sessions to operational state.
8. Add targeted runtime coverage for mode separation and export contract behavior.

## Acceptance
- Tool mode only exposes tool import/export actions.
- Workspace mode only exposes workspace import/export actions.
- Workspace export is portable wrapper contract and excludes runtime-only fields.
- Save/Load/Overwrite/Diff/Merge remain operational after workspace import.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
