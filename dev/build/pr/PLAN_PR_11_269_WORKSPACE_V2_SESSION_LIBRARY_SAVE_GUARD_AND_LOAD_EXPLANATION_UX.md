# PLAN_PR_11_269_WORKSPACE_V2_SESSION_LIBRARY_SAVE_GUARD_AND_LOAD_EXPLANATION_UX

## Purpose
Add Workspace V2 Session Library new-session save guard rules and clarify load/save UX messaging.

## Scope
- toolbox/workspace-v2/index.html
- toolbox/workspace-v2/index.js
- tests/runtime/V2SessionLibrarySaveGuard.test.mjs
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2SessionLibraryActions.test.mjs
- docs/report only

## Goals
- Save Session enabled only when:
  - active Workspace V2 session exists
  - new session ID is valid
  - ID does not already exist in saved sessions
- Save Session disabled for empty, invalid, or duplicate IDs.
- Existing saved session management remains card-level authoritative.
- Load from saved card loads active session without mutating or duplicating saved copy.
- Add concise helper text explaining Save/Load/Overwrite/Delete behavior.
- Show required duplicate-ID status text.

## Out of Scope
- No schema changes
- No cross-tool changes
- No merge/diff behavior changes beyond state recompute wiring

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibrarySaveGuard.test.mjs
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibrarySaveGuard.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
