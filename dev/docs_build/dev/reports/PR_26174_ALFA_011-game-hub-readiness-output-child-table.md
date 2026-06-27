# PR_26174_ALFA_011-game-hub-readiness-output-child-table

## Purpose

Make Readiness Output a separate child table under the expanded game row.

## Summary

- Added a separate Readiness Output child table to expanded Game Hub parent rows.
- Kept Readiness Output separate from Source Idea and Game Summary child tables.
- Displayed existing progress/readiness output fields and checklist rows only.
- Preserved the existing Game Hub API/service contract and did not change Game Journey bucket ordering.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub creates, opens, and deletes mock games"`
