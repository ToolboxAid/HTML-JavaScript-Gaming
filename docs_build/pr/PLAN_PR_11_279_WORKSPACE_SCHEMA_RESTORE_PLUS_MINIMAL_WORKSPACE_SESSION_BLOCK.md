# PLAN_PR_11_279_WORKSPACE_SCHEMA_RESTORE_PLUS_MINIMAL_WORKSPACE_SESSION_BLOCK

## Purpose
Restore `src/shared/schemas/workspace.schema.json` games entry shape to project-manifest usage and add one minimal optional `workspaceSession` resume block for Workspace V2 export/import.

## Scope
- src/shared/schemas/workspace.schema.json
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2CurrentSessionExport.test.mjs
- docs_build/dev/reports/PR_11_279_workspace_schema_restore_and_minimal_workspace_session_block_report.md

## Goals
- Remove `games[].session` from workspace schema and keep games entries manifest/project-only.
- Add strict optional root `workspaceSession` with only:
  - `schema`
  - `defaultToolId`
  - `activeToolId`
  - `activeHostContextId`
  - `activeSession`
  - `savedSessions`
- Keep payloads in `workspaceSession.activeSession/savedSessions`, never in `games[]`.
- Enforce Workspace V2 export/import validation against `src/shared/schemas/workspace.schema.json`.
- Preserve same-tool diff guard behavior from PR_11_278.

## Out Of Scope
- No tool schema changes.
- No `src/shared/schemas/workspace.manifest.schema.json` changes.
- No unrelated Workspace V2 features.

## Validation
- `node --check toolbox/workspace-v2/index.js`
- `node --check tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2CurrentSessionExport.test.mjs`
- `node tests/runtime/V2SessionMerge.test.mjs`
