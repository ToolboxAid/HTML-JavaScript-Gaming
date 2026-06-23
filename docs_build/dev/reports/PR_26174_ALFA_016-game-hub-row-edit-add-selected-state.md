# PR_26174_ALFA_016-game-hub-row-edit-add-selected-state

## Purpose

Move Game Hub add/edit behavior into the game table and correct selected-state styling.

## Summary

- Moved the active-game selected state from the Actions edit button to the Game column cell/button.
- Kept Edit as a plain row action and rendered Save/Cancel only while a row is editing.
- Added a bottom Add Game row that expands into Game, Purpose, and Status fields with Save/Cancel actions.
- Removed the old sidebar add-game form while preserving the existing API/service contract.
- Preserved Game, Purpose, Status, Owner, and Actions columns.
- Preserved Source Idea and Readiness Output child rows under game parent rows.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games|Game Hub validates game parent rows and child tables|Game Hub preserves guest browsing and blocks guest saves|Game Hub shows a creator-safe empty state when no projects exist|Game Hub shows a creator-safe unavailable state when project list API fails|Game Hub displays and edits game purpose and member role|Game Hub readiness child rows update from mock game state"`
PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
PASS - `git diff --check -- assets/theme-v2/css/tables.css toolbox/game-hub/index.html toolbox/game-hub/game-hub.js tests/playwright/tools/GameHubMockRepository.spec.mjs`

