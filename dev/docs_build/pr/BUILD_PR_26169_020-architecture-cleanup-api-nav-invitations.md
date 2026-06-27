# BUILD_PR_26169_020-architecture-cleanup-api-nav-invitations

## Objective
- Clean up product/web API client ownership, Admin/Owner navigation duplication, and Beta invitation personalization fields without changing billing, checkout, legal content, or engine runtime APIs.

## Source Documents
- User request for `PR_26169_020-architecture-cleanup-api-nav-invitations`.
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Relevant prior reports:
  - `docs_build/dev/reports/PR_26169_003-beta-invitations-admin.md`
  - `docs_build/dev/reports/PR_26169_017-owner-memberships.md`
  - `docs_build/dev/reports/PR_26169_018-owner-ai-credits.md`
  - `docs_build/dev/reports/PR_26169_019-admin-health-operations.md`
- Matching PLAN_PR: not present in repo; execute from this BUILD and the user request.

## Scope
- Move non-engine product/web API clients from `src/engine/api` to `src/api`.
- Leave true shared engine/runtime server API plumbing in `src/engine/api/server-api-client.js`.
- Add shared Admin and Owner navigation configuration.
- Render touched Admin/Owner sidebars from the shared navigation source instead of hardcoded page-local link lists.
- Extend Admin Beta invitations with personalization fields:
  - recipient name.
  - relationship note.
  - personal message.
  - invite source.
- Document the `src/dev-runtime` boundary and validate that UAT/PROD-facing browser/runtime code does not import or bundle `src/dev-runtime`.

## Non-Scope
- No billing.
- No marketplace checkout.
- No legal content expansion.
- No game-engine/runtime API move.
- No Owner business model editing changes.
- No invitation status behavior rewrite.

## Target Files
- `src/api/*-api-client.js`
- `src/api/db-viewer-ui.js`
- `src/api/admin-owner-navigation.js`
- `src/engine/api/*-api-client.js` removed for moved product/web clients
- `assets/theme-v2/js/admin-owner-navigation.js`
- Touched page imports under `assets/theme-v2/js/`, `admin/`, `account/`, and `toolbox/`
- `toolbox/toolRegistry.js`
- `src/shared/toolbox/tool-metadata-inventory.js`
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/DEV_RUNTIME_BOUNDARY.md`
- `scripts/validate-dev-runtime-boundary.mjs`
- `admin/invitations.html`
- touched Admin/Owner sidebar pages:
  - `admin/invitations.html`
  - `admin/system-health.html`
  - `admin/infrastructure.html`
  - `admin/environments.html`
  - `admin/game-migration.html`
  - `admin/platform-settings.html`
  - `admin/site-setup.html`
  - `admin/tool-votes.html`
  - `admin/users.html`
  - `owner/ai-credits.html`
  - `owner/memberships.html`
- `tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- `tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs`
- `tests/playwright/tools/AdminInvitationsNavPage.spec.mjs`

## Implementation Requirements
- Product/web API clients must live under `src/api`.
- `src/engine/api/server-api-client.js` remains in place because it owns shared Browser -> Server API plumbing and tool/runtime repository helpers.
- Moved clients must import shared server API plumbing from `../engine/api/server-api-client.js`.
- Browser pages and tests must import product/web clients from `src/api`.
- Admin navigation source of truth must include present operational pages:
  - Infrastructure.
  - Invitations.
  - Operations.
  - Platform Settings.
  - System Health.
  - Tool Votes.
  - Users.
- Owner navigation source of truth must include present business-control pages:
  - AI Credits.
  - DB Viewer.
  - Design System.
  - Grouping Colors.
  - Memberships.
- Touched Admin/Owner pages must not duplicate sidebar link lists in HTML.
- Invitation create/list/accept/revoke/expire flows must preserve pending, accepted, revoked, and expired status behavior.
- Invitation personalization fields must be accepted by API, stored in invitation rows, exposed in public invitation DTOs, and rendered in Admin UI.
- `src/dev-runtime` documentation must explain:
  - it is dev-only runtime implementation.
  - it is not `tests/dev-runtime` because it serves browser-visible Local API runtime behavior.
  - UAT/PROD must not import or bundle it.
- A validation script must confirm UAT/PROD-facing browser/runtime files do not import `src/dev-runtime`.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for touched JavaScript and MJS files.
- Run static HTML restriction checks for touched HTML files.
- Run product API/nav/dev-runtime boundary unit validation:
  - `node --test tests/dev-runtime/ArchitectureCleanupApiNavInvitations.test.mjs`
- Run Beta invitation targeted validation:
  - `node --test tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- Run dev-runtime boundary validation:
  - `node scripts/validate-dev-runtime-boundary.mjs`
- Run targeted Admin invitation/nav Playwright validation:
  - `npx playwright test tests/playwright/tools/AdminInvitationsNavPage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Run scoped `git diff --check`.
- Do not run full samples validation.

## Acceptance Criteria
- Non-engine product/web API clients no longer live under `src/engine/api`.
- True shared server API plumbing remains available for engine/runtime/tool code.
- Admin and Owner navigation have shared source-of-truth data.
- Touched Admin/Owner sidebars render from the shared navigation source.
- Admin Invitations supports and displays recipient name, relationship note, personal message, and invite source.
- Invitation status behavior remains intact.
- `src/dev-runtime` purpose and UAT/PROD import boundary are documented and validated.
