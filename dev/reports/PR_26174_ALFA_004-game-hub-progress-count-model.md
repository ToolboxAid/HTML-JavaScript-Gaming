# PR_26174_ALFA_004-game-hub-progress-count-model

## Purpose

Add the count-based Game Journey progress model foundation.

## Summary

- Updated Game Journey recommended count targets to the creator-editable Hero, Enemy, Boss, Background, and Music model.
- Scoped recommended target persistence to the active game and active Journey bucket records.
- Preserved the existing Web UI -> Local API/service contract -> database flow for numeric target saves.
- Extended targeted Playwright coverage for defaults, edited numeric count persistence, and server-owned bucket linkage.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs -g "Game Journey exposes static tool ownership areas|Game Journey progress dashboard summarizes completion metrics|Game Journey summary table uses inline notes"`
