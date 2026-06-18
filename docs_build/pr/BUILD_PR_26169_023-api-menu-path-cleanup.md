# BUILD_PR_26169_023-api-menu-path-cleanup

## Objective
- Finish PR020 architecture cleanup by moving non-engine API plumbing out of `src/engine/api`, separating Admin and Owner menu responsibilities, validating active menu paths, preserving invitation personalization, and keeping the dev-runtime boundary intact.

## Source Documents
- User request for `PR_26169_023-api-menu-path-cleanup`.
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/pr/BUILD_PR_26169_020-architecture-cleanup-api-nav-invitations.md`
- `docs_build/dev/reports/PR_26169_020-architecture-cleanup-api-nav-invitations.md`

## Scope
- Move `src/engine/api/server-api-client.js` to `src/api/server-api-client.js` because it is Browser -> Server API plumbing and is not engine-specific.
- Update all imports to use `src/api/server-api-client.js`.
- Keep `src/engine/api` free of product/web API clients.
- Update shared Admin/Owner navigation source of truth.
- Keep Admin menu operational/platform-only.
- Keep Owner menu business-control-only.
- Move existing business-control pages from `admin/` to `owner/` when their path currently conflicts with responsibility.
- Add targeted validation that active Admin/Owner shared menu links resolve to existing files and disabled/planned menu items do not produce active broken links.
- Verify Beta invitation personalization remains intact.
- Verify dev-runtime remains dev-only and UAT/PROD-facing files do not import it.

## Non-Scope
- No billing.
- No marketplace checkout.
- No new legal content.
- No new Owner/Admin pages solely to satisfy planned menu labels.
- No compatibility aliases unless validation proves they are required.
- No full samples smoke.

## Target Files
- `src/engine/api/server-api-client.js`
- `src/api/server-api-client.js`
- API clients under `src/api/`
- API clients under `toolbox/`
- `assets/theme-v2/js/account-achievements.js`
- `assets/theme-v2/js/admin-db-status-panel.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `src/api/admin-owner-navigation.js`
- `assets/theme-v2/js/admin-owner-navigation.js`
- Business-control page moves:
  - `admin/branding.html` -> `owner/branding.html`
  - `admin/design-system.html` -> `owner/design-system.html`
  - `admin/grouping-colors.html` -> `owner/grouping-colors.html`
  - `admin/site-settings.html` -> `owner/site-settings.html`
  - `admin/themes.html` -> `owner/themes.html`
- `tests/dev-runtime/ApiMenuPathCleanup.test.mjs`
- `tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs`
- `tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- `tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs`

## Implementation Requirements
- `src/engine/api` must contain no files after this PR unless a true engine-specific API file exists.
- `src/api/server-api-client.js` must be the only shared Browser -> Server API client module.
- Imports must not reference `src/engine/api/server-api-client.js`.
- Do not create duplicate API clients or long-term compatibility wrappers.
- Owner menu items:
  - Owner Tools
  - AI Credits
  - Branding
  - Design System
  - Grouping Colors
  - Legal
  - Memberships
  - Marketplace Settings
  - Notes
  - Revenue
  - Site Settings
  - Themes
- Admin menu items:
  - Admin Tools
  - Analytics
  - Controls
  - DB Viewer
  - Environments
  - Game Migration
  - Infrastructure
  - Invitations
  - Moderation
  - Operations
  - Platform Settings
  - Ratings
  - Roles
  - Site Setup
  - System Health
  - Tool Votes
  - Users
- Owner menu active links must point only at existing `owner/` business pages.
- Owner menu planned items without pages must be disabled/planned and must not create broken links.
- Admin menu active links must point only at existing `admin/` operational/platform pages.
- Admin menu must not include Owner-only pricing, revenue, legal editing, brand identity, or AI pricing controls.
- Admin/Owner shared menu renderers must support disabled/planned items.
- Beta invitation fields must remain intact:
  - `recipientName`
  - `relationshipNote`
  - `personalMessage`
  - `inviteSource`
  - accepted/not accepted status tracking
- `scripts/validate-dev-runtime-boundary.mjs` must keep enforcing the existing boundary.

## Validation Requirements
- Verify branch is `main`.
- Run `node scripts/validate-dev-runtime-boundary.mjs`.
- Run `node --check` for all touched JavaScript/MJS files.
- Run targeted API/menu path validation:
  - `node --test tests/dev-runtime/ApiMenuPathCleanup.test.mjs`
- Run targeted Admin/Owner navigation validation:
  - `node --test tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs`
- Run targeted invitation validation:
  - `node --test tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- Run targeted Admin/Owner UI navigation Playwright validation:
  - `npx playwright test tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs`
- Run scoped static HTML restriction checks for moved/touched Owner/Admin pages.
- Run `git diff --check`.

## Acceptance Criteria
- No UAT/PROD-facing file imports or references `src/dev-runtime`.
- `toolbox/toolRegistry.js` remains clean of `src/dev-runtime`.
- `src/engine/api` has no product/web API clients and no non-engine server API client.
- Active Admin/Owner menu links resolve to existing files.
- Disabled/planned Owner menu items do not produce active broken links.
- Admin and Owner menus have non-overlapping responsibilities.
- Invitation personalization and status tracking tests pass.
- Required reports and repo-structured ZIP are produced.
