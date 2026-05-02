# BUILD_PR_11_276_WORKSPACE_V2_STRICT_NAV_MODE_SEPARATION

## Purpose
Continue/fix PR_11_276 by enforcing strict Workspace V2 navigation mode separation and workspace-session-only import/export controls.

## Files
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs/dev/reports/PR_11_276_workspace_v2_nav_mode_and_export_contract_report.md

## Implementation
1. Remove nav mode dropdown and all navTools UI controls from Workspace V2.
2. Keep only workspace-session import/export controls in Workspace V2.
3. Wire existing Workspace V2 import/export buttons directly to workspace-session handlers.
4. Keep tool-mode handlers unavailable on Workspace V2 (no mode switching surface).
5. Preserve workspace-session export contract:
   - workspace identity/version
   - active/default tool identity
   - toolSessions grouped by toolId/sessionId
   - savedSessions
   - excludes runtime-only fields (sessionHistory/sessionSelection/mergeAuditLog/lone activeSessionPayload)
6. Update runtime test to assert strict no-overlap behavior and tool-page workspace-control absence.

## Acceptance
- Workspace V2 has no mode switch and no tool import/export controls.
- Workspace V2 import/export is workspace-session only.
- Tool pages do not expose workspace import/export controls.
- No navTools/navWorkspace overlap on any page.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
