# PLAN_PR_11_268_WORKSPACE_V2_SESSION_LIBRARY_ACTION_CLEANUP

## Purpose
Clean up Workspace V2 Session Library actions to remove duplicate/confusing top-level controls.

## Scope
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2SessionLibraryActions.test.mjs
- docs/report only

## Goals
- Keep saved-session card actions as authoritative for existing saved sessions.
- Top Session Library input area supports creating new saved sessions only (`Save Session`).
- Hide top Overwrite/Load/Delete controls to eliminate duplicate action paths.
- Ensure save status message directs management to Saved Sessions cards.
- Keep messages current-state-specific and non-stale.

## Out of Scope
- No schema changes
- No cross-tool changes
- No merge/diff algorithm changes

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
