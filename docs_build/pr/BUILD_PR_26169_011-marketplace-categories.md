# BUILD_PR_26169_011-marketplace-categories

## Objective
- Implement DB-backed marketplace categories for browsing and listing classification.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_011-marketplace-categories.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream marketplace membership rules: `docs_build/pr/BUILD_PR_26169_009-marketplace-membership-rules.md`

## Scope
- Add `marketplace_categories` as the shared category source because no existing category source is present.
- Seed the seven approved marketplace categories.
- Expose categories through a Local API and browser client.
- Render marketplace category filters from the shared source.
- Add targeted category validation and marketplace page coverage.

## Non-Scope
- No marketplace item migration.
- No seller revenue model changes.
- No checkout or download implementation.
- No category moderation workflow.
- No marketplace listing persistence changes.

## Target Files
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/seed-db-keys.mjs`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/marketplace/marketplace-category-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/marketplace-api-client.js`
- `assets/theme-v2/js/marketplace-page.js`
- `marketplace/index.html`
- `tests/dev-runtime/MarketplaceCategories.test.mjs`
- `tests/playwright/tools/PublicMarketplacePage.spec.mjs`

## Implementation Requirements
- Add `marketplace_categories` schema fields:
  - `key`
  - `code`
  - `displayName`
  - `active`
  - `sortName`
  - audit fields
- Seed exact category codes:
  - `games`
  - `assets`
  - `audio`
  - `music`
  - `worlds`
  - `templates`
  - `tutorials`
- Category display labels must be:
  - Games
  - Assets
  - Audio
  - Music
  - Worlds
  - Templates
  - Tutorials
- Browseable category output must sort alphabetically:
  - Assets
  - Audio
  - Games
  - Music
  - Templates
  - Tutorials
  - Worlds
- Category data must come from the service/API, not page-local arrays.
- Invalid category codes must produce visible diagnostics through the service.

## UI Requirements
- Marketplace page category filters must use the category API.
- The page must not own a hardcoded category list.
- Category labels must be plain names.
- The list must render alphabetically.
- Keep all CSS and JavaScript external.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `marketplace/index.html`.
- Run targeted category tests:
  - `node --test tests/dev-runtime/MarketplaceCategories.test.mjs`
- Re-run marketplace page Playwright tests:
  - `npx playwright test tests/playwright/tools/PublicMarketplacePage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Do not run full samples validation.

## Acceptance Criteria
- All seven approved categories exist exactly.
- No unapproved categories appear in browse UI.
- Category browse filters use the shared service/API source.
- Invalid category records are diagnosed.
- Browseable category order follows alphabetical governance.
- Required reports and repo-structured ZIP artifact are produced.

