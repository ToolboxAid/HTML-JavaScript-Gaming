# BUILD_PR_11_279_WORKSPACE_SCHEMA_RESTORE_PLUS_MINIMAL_WORKSPACE_SESSION_BLOCK

## Purpose
Correct workspace schema/session contract boundaries after PR_11_278 by restoring `games[]` manifest shape and moving Workspace V2 resume state to a minimal root `workspaceSession` block.

## Files
- tools/schemas/workspace.schema.json
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/dev/reports/PR_11_279_workspace_schema_restore_and_minimal_workspace_session_block_report.md

## Implementation
1. Remove `games[].session` from `tools/schemas/workspace.schema.json`.
2. Add optional strict root `workspaceSession` block with only:
   - `schema`
   - `defaultToolId`
   - `activeToolId`
   - `activeHostContextId`
   - `activeSession`
   - `savedSessions`
3. Keep `games[]` validation and usage for manifest/project entries only.
4. Update Workspace V2 export builder to:
   - emit workspace manifest fields + unchanged `games[]`
   - emit optional `workspaceSession` resume block
   - avoid `workspaceV2Session/toolSessions/savedSessions/exportedAt` wrappers.
5. Update Workspace V2 import validator to accept only workspace-schema-conformant payloads and process optional `workspaceSession` resume block.
6. Keep diff same-tool guard behavior unchanged.
7. Update targeted runtime test to validate restored boundary and minimal session block.

## Acceptance
- `games[]` no longer stores session snapshots.
- `workspaceSession` is the only minimal resume state block.
- Workspace export/import validates against `tools/schemas/workspace.schema.json`.
- Cross-tool diff stays blocked with required message.

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2SessionMerge.test.mjs`
