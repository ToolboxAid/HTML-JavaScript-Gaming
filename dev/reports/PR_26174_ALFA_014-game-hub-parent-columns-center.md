# PR_26174_ALFA_014-game-hub-parent-columns-center

## Purpose

Update Game Hub parent table columns to the approved centered parent-row structure.

## Summary

- Moved the Game Hub parent table into the center panel.
- Removed the old Project Information table/card layout and its Role/Next Tool display columns.
- Kept each game as a parent row with Game, Purpose, Status, Owner, and Actions columns.
- Preserved Source Idea and Readiness Output as child row tables under the game parent row.
- Preserved the existing Game Hub API/service contract and readiness output model.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games|Game Hub validates game parent rows and child tables|Game Hub preserves guest browsing and blocks guest saves|Game Hub shows a creator-safe empty state|Game Hub shows a creator-safe unavailable state|Game Hub displays and edits game purpose and member role|Game Hub readiness child rows update from mock game state"`
PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
PASS - `git diff --check -- toolbox/game-hub/index.html toolbox/game-hub/game-hub.js tests/playwright/tools/GameHubMockRepository.spec.mjs tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
