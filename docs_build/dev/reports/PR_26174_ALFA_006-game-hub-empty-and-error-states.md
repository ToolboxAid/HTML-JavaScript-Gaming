# PR_26174_ALFA_006-game-hub-empty-and-error-states

## Purpose

Add creator-safe empty and API-unavailable states for Game Hub projects.

## Summary

- Added a distinct Game Hub project-list empty state for no available projects.
- Added a distinct project-list unavailable state when the Local API/service contract cannot return projects.
- Kept creator-facing messages free of server, database, repository, stack, or secret details.
- Added targeted Playwright coverage for empty and unavailable project-list states.

## Validation

PASS - `npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs -g "Game Hub shows a creator-safe empty state|Game Hub shows a creator-safe unavailable state"`
