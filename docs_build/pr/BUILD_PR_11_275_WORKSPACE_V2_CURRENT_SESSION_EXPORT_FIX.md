# BUILD_PR_11_275_WORKSPACE_V2_CURRENT_SESSION_EXPORT_FIX

## Purpose
Implement Workspace V2 current-session JSON export download behavior with explicit actionable status text.

## Files
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/dev/reports/PR_11_275_workspace_v2_current_session_export_fix_report.md

## Implementation
1. Update `exportCurrentSessionJson()` to resolve export payload from active session source via `readActiveSessionPayloadForLibraryActions()`.
2. If no active valid session exists, show:
   - `No active Workspace V2 session is available to export.`
3. If active session exists:
   - Serialize exact active payload JSON
   - Create Blob and object URL
   - Trigger browser download via temporary anchor
   - Filename includes tool/session identity when available
   - Show status: `Exported current workspace session JSON.`
4. Preserve payload unchanged; no fallback/default data path.
5. Add targeted runtime test verifying:
   - active export status and filename identity
   - no-active export status
   - payload preservation and required code tokens

## Acceptance
- Export button triggers JSON download for active session.
- No-active export path is explicit and actionable.
- Export source aligns with active-session source path used by Save flow checks.
- No session behavior changes outside export controls.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
