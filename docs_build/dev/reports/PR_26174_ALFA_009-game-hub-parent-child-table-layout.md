# PR_26174_ALFA_009-game-hub-parent-child-table-layout

## Purpose

Convert Game Hub Open Games into a reusable parent-table / child-table structure.

## Summary

- Rendered Open Games as a parent data table with one row per game.
- Added expand/collapse controls for each game row.
- Added a nested Game Summary child table in the expanded row using the existing parent-row plus expanded-child-row pattern.
- Preserved existing Local API/service repository calls and Open button behavior.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games"`
PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub shows a creator-safe empty state|Game Hub shows a creator-safe unavailable state"`
