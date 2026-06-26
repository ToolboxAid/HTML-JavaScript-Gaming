# PR_26177_ALFA_058-flat-project-tags Report

## Summary
- Reworked Tags to use Browser -> API -> Database through the shared server repository client and DB-backed API service.
- Removed retired Tags, Game Design, and Game Configuration mock repository files from the active runtime stack.
- Updated `local-api-router.mjs` so Tags, Game Design, and Game Configuration route to API database services rather than mock repositories.
- Added guardrail coverage that fails if retired Alfa mock repository files exist or are imported by active JS/MJS.
- Kept Tags flat: no category table, category UI, grouped category filtering, or category-owned seed data.

## Data Contract
- DDL remains under `docs_build/database/ddl/`.
- Tags use `project_tags` and `project_tag_assignments` only.
- Server/API owns authoritative keys for created records.
- Records include `createdAt`, `updatedAt`, `createdBy`, `updatedBy` and ownership references `users.key`.
- Browser does not own product data and does not use JSON/local storage as source of truth.

## Validation
- PASS - `node --check src/dev-runtime/toolbox-api/alfa-tool-services.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS - `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs`
- PASS - `npx playwright test tests/playwright/tools/TagsTool.spec.mjs --project=playwright`
- PASS - `npx playwright test tests/playwright/tools/GameDesignApiDb.spec.mjs --project=playwright`
- PASS - `npx playwright test tests/playwright/tools/GameConfigurationApiDb.spec.mjs --project=playwright`
- PASS - `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --project=playwright`
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright -g "Asset repository exposes catalog tables"`
- INFO - Full `AssetToolMockRepository.spec.mjs` was not part of the impacted lane and timed out when run as a broad suite; the touched Asset tag-reference test passed.

## Removed Mock Repository Files
- `src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js`
- `src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js`
- `src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js`

## Status
PASS - PR058 is reworked and ready for owner testing after the stack-wide no-mock correction is propagated to PR059-PR061.
