# PLAN_PR_11_266_WORKSPACE_V2_SESSION_TOOLS_CLOSEOUT_BUNDLE

## Purpose
Close out remaining Workspace V2 session tooling UX correctness issues in one targeted, testable bundle.

## Scope
- tools/workspace-v2/index.js
- tests/runtime/V2SessionToolsCloseoutBundle.test.mjs
- docs/report only

## Goals
- Fix stale status text after session selection and refresh actions.
- Fix stale diff output visibility after selection/delete/refresh changes.
- Keep invalid actions visibly blocked with clear current-state messages.
- Keep merge/diff button state behavior under the PR_11_264/265 deterministic model.
- Improve delete/refresh consistency for diff/merge/session views.

## Out of Scope
- No schema changes
- No samples/games/tool-registry changes
- No cross-tool changes

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2SessionToolsCloseoutBundle.test.mjs
- node tests/runtime/V2SessionToolsCloseoutBundle.test.mjs
- node tests/runtime/V2DeterministicStateTransitions.test.mjs
- node tests/runtime/V2SessionStateModelConsolidation.test.mjs
