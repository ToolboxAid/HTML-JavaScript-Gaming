# PLAN_PR_11_267_WORKSPACE_V2_DEFAULT_TOOL_PRODUCER_INIT_FIX

## Purpose
Fix Workspace V2 default tool selection and producer initialization so Save Session works immediately after load.

## Scope
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs
- docs/report only

## Goals
- Set Palette Manager V2 as explicit default tool on load.
- Initialize a real active Workspace V2 session on initial load.
- Ensure Save Session can succeed for new IDs immediately after load.
- Keep behavior aligned with PR_11_264/265 deterministic state model.

## Out of Scope
- No schema changes
- No cross-tool changes
- No fallback/default demo data

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs
- node tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
