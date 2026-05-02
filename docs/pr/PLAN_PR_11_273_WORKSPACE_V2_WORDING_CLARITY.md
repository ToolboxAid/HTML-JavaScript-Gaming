# PLAN_PR_11_273_WORKSPACE_V2_WORDING_CLARITY

## Purpose
Improve Workspace V2 wording clarity for Session Library and Session Diff Viewer with text-only updates.

## Scope
- tools/workspace-v2/index.html
- tools/workspace-v2/index.js
- tests/runtime/V2SessionLibraryActions.test.mjs
- tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- tests/runtime/V2DiffViewerMessaging.test.mjs
- docs/report only

## Goals
- Replace Save/Overwrite/Load status text with explicit action + session ID + result wording.
- Replace duplicate-save guidance with clear Load/Overwrite direction.
- Add overwrite helper text in Session Library copy.
- Replace vague diff completion messaging with explicit identical-vs-different messages.
- Remove lingering vague phrase `Saved session updated.`
- Keep behavior unchanged.

## Out of Scope
- No merge/diff algorithm changes.
- No schema/sample/game/workspace-v1 changes.
- No cross-tool changes.

## Validation
- node --check tools/workspace-v2/index.js
- node --check tests/runtime/V2SessionLibraryActions.test.mjs
- node --check tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node --check tests/runtime/V2DiffViewerMessaging.test.mjs
- node tests/runtime/V2SessionLibraryActions.test.mjs
- node tests/runtime/V2SessionLibraryActionCleanup.test.mjs
- node tests/runtime/V2DiffViewerMessaging.test.mjs
