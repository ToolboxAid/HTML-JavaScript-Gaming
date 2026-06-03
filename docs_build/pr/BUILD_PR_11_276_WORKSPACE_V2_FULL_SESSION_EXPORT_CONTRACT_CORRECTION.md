# BUILD_PR_11_276_WORKSPACE_V2_FULL_SESSION_EXPORT_CONTRACT_CORRECTION

## Purpose
Implement full Workspace V2 session-container export from the current export control path.

## Files
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/dev/reports/PR_11_276_workspace_v2_full_session_export_contract_correction_report.md

## Implementation
1. Keep active-session export gate based on `readActiveSessionPayloadForLibraryActions()`.
2. Build export payload as Workspace wrapper object (not single tool payload):
   - `version`, `toolId: workspace-v2`
   - `workspaceSession` container including identity, active session payload, sessionLibrary, sessionHistory, selection metadata, and merge audit metadata.
3. Keep exact success/failure export statuses:
   - success: `Exported current workspace session JSON.`
   - no active session: `No active Workspace V2 session is available to export.`
4. Block export when Session Library is invalid to prevent silent data loss.
5. Keep JSON download behavior and include workspace/tool/session identity in filename.
6. Update targeted runtime test to validate full-session-wrapper export contract.

## Acceptance
- Export outputs full Workspace V2 container.
- Active tool payload remains intact inside container.
- Session metadata required by save/load/diff/merge context is included.
- No export fallback/default data.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2CurrentSessionExport.test.mjs
- node tests/runtime/V2CurrentSessionExport.test.mjs
