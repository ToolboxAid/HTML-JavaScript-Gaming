# PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup

## Purpose

Clean up Game Hub parent-row actions and setup controls while preserving the parent/child table contract.

## Summary

- Replaced Game Hub parent-row `Open {game}` action text with `Edit`.
- Added a theme-backed active-game visual state on the active parent row.
- Removed the standalone Open Game Journey action from Game Hub.
- Replaced the old Game Setup accordion with a direct Add game control surface.
- Kept parent columns as Game, Purpose, Status, Owner, and Actions.
- Kept Source Idea and Readiness Output as child row tables under each game parent row.
- Preserved the existing API/service contract and did not add browser-owned project data.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games|Game Hub validates game parent rows and child tables|Game Hub preserves guest browsing and blocks guest saves|Game Hub shows a creator-safe empty state when no projects exist|Game Hub shows a creator-safe unavailable state when project list API fails|Game Hub displays and edits game purpose and member role|Game Hub readiness child rows update from mock game state"`
PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
PASS - `git diff --check -- assets/theme-v2/css/tables.css toolbox/game-hub/index.html toolbox/game-hub/game-hub.js tests/playwright/tools/GameHubMockRepository.spec.mjs tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`

