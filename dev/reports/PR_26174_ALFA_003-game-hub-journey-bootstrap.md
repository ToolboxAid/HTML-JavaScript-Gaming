# PR_26174_ALFA_003-game-hub-journey-bootstrap

## Purpose

Create starter Game Journey records when an Idea Board idea becomes a Game Hub project.

## Summary

- Added Local API/service contract bootstrap after Game Hub project creation.
- Added server-owned Game Journey starter buckets in the required order with authoritative note and item keys.
- Added placeholder Journey items for each starter bucket and persisted bucket order in the mock database schema.
- Extended impacted Playwright coverage to verify bootstrap response keys, bucket order, Journey display, and Local API persistence.

## Validation

PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
