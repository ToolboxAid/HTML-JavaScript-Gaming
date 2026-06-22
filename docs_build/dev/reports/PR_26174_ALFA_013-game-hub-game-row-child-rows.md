# PR_26174_ALFA_013-game-hub-game-row-child-rows

## Purpose

Correct Game Hub so each game is the parent row and Source Idea plus Readiness Output render as child rows/child tables.

## Summary

- Removed the Open Games wrapper/table identity from the Game Hub list table.
- Removed the Game Summary child table from expanded game rows.
- Rendered each expanded game as two child rows in this order: Source Idea, Readiness Output.
- Preserved the existing Game Hub API/service contract and safe empty/unavailable states.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games|Game Hub validates game parent rows and child tables|Game Hub shows a creator-safe empty state|Game Hub shows a creator-safe unavailable state"`
PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
PASS - `git diff --check`
