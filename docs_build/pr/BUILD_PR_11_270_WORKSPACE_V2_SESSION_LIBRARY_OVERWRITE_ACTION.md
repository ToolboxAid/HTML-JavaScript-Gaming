# BUILD_PR_11_270_WORKSPACE_V2_SESSION_LIBRARY_OVERWRITE_ACTION

## Purpose
Implement card-level overwrite for existing saved sessions in Workspace V2 Session Library.

## Files
- toolbox/workspace-v2/index.js
- tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2SessionLibraryActions.test.mjs
- docs_build/dev/reports/PR_11_270_workspace_v2_session_library_overwrite_action_report.md

## Implementation
1. Add `Overwrite` button to each saved session card.
2. Gate row overwrite button enablement on active Workspace V2 session availability.
3. Add `overwriteSavedSessionById(sessionId)` for row-authoritative overwrite behavior.
4. Preserve existing session ID; replace saved payload only.
5. Keep Save path new-only and duplicate-ID-blocked.
6. Emit `Saved session updated.` on successful overwrite.

## Acceptance
- Card-level overwrite exists and is active-session-gated.
- Overwrite updates saved payload in place with no new ID creation.
- Save remains new-only; duplicate IDs blocked on Save.
- Status text is current-state and non-stale.

## Validation
- node --check toolbox/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibraryCardOverwrite.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
