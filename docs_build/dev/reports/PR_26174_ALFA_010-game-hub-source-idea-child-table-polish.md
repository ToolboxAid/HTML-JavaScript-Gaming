# PR_26174_ALFA_010-game-hub-source-idea-child-table-polish

## Purpose

Make Source Idea a dedicated child table under the expanded game row.

## Summary

- Added a Source Idea child table to expanded Game Hub parent rows.
- Displays source idea, pitch, and read-only source note rows when data is present.
- Kept source idea context free of edit/delete controls.
- Preserved the existing Local API/service contract and source idea normalization.

## Validation

PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs -g "Idea Board uses accordion table ideas and notes"`
