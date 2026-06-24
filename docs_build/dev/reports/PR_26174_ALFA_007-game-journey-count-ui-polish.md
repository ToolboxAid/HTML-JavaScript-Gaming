# PR_26174_ALFA_007-game-journey-count-ui-polish

## Purpose

Polish count-based Game Journey inputs.

## Summary

- Added live [count] previews to Game Journey recommended target labels.
- Clarified the recommended target table header from Suggested to Count.
- Kept native numeric inputs and added numeric input hints.
- Extended targeted Playwright coverage for order, no-checkbox model, live preview updates, and API/service contract persistence.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs -g "Game Journey progress dashboard summarizes completion metrics"`
