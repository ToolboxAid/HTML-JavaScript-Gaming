# BUILD_PR_11_268_WORKSPACE_V2_SESSION_LIBRARY_ACTION_CLEANUP

## Purpose
Remove duplicate Session Library action paths and make card-level actions authoritative for existing saved sessions.

## Files
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2SessionLibraryActions.test.mjs
- docs_build/dev/reports/PR_11_268_workspace_v2_session_library_action_cleanup_report.md

## Implementation
1. Update Session Library input label/help text to "new save" workflow language.
2. Keep top `Save Session` action visible.
3. Hide top Overwrite/Load/Delete controls.
4. Keep existing row/card actions for existing saved sessions.
5. Update save duplicate/success messages to card-management wording.
6. Update targeted tests to match cleaned action model.

## Acceptance
- No duplicate top-level paths for load/delete/overwrite.
- Saved-session cards remain the authoritative controls for existing entries.
- Save success clearly directs users to card-level management.
- No unrelated Workspace V2 areas changed.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
