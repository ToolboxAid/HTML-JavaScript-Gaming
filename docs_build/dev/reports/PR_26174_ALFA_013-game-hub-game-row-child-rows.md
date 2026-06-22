# PR_26174_ALFA_013-game-hub-game-row-child-rows

## Purpose

Correct Game Hub so each game is the parent row and Source Idea plus Readiness Output render only as child rows/child tables under that game row.

## Summary

- Applied the updated table_first_ui.md guidance and matched the Idea Board parent-row/expanded-child-row pattern.
- Removed the Open Games wrapper/table identity from the Game Hub list table.
- Removed standalone Source Idea, Game Foundation, and Readiness Output panel/card sections.
- Kept Source Idea and Readiness Output as the two expanded child rows under each game parent row.
- Preserved the existing Game Hub API/service contract and safe empty/unavailable states.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games|Game Hub validates game parent rows and child tables|Game Hub shows a creator-safe empty state|Game Hub shows a creator-safe unavailable state|Game Hub readiness child rows update from mock game state"`
PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
PASS - `git diff --check -- toolbox/game-hub/index.html toolbox/game-hub/game-hub.js tests/playwright/tools/GameHubMockRepository.spec.mjs tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
