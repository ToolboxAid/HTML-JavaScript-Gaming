# PLAN_PR_11_270_WORKSPACE_V2_SESSION_LIBRARY_OVERWRITE_ACTION

## Purpose
Add a saved-session card overwrite action in Workspace V2 Session Library, aligned with new-only Save rules.

## Scope
- toolbox/workspace-v2/index.js
- tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2SessionLibraryActions.test.mjs
- docs/report only

## Goals
- Add `Overwrite` on each saved session card.
- Enable overwrite only when active Workspace V2 session exists.
- Overwrite replaces payload for that saved session ID only.
- Overwrite does not create new session ID or duplicate entry.
- Show exact confirmation: `Saved session updated.`
- Keep Save new-only and duplicate-save blocked.

## Out of Scope
- No schema changes
- No merge/diff algorithm changes
- No cross-tool changes

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
