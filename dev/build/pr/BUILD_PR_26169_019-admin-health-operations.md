# BUILD_PR_26169_019-admin-health-operations

## Objective
- Implement Admin-only operational health visibility for memberships, invitations, AI credits, marketplace seller/revenue readiness, teams, and required DB configuration.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_019-admin-health-operations.md`
- Upstream invitation dependency: `docs_build/pr/BUILD_PR_26169_003-beta-invitations-admin.md`
- Upstream membership dependency: `docs_build/pr/BUILD_PR_26169_005-membership-assignment.md`
- Upstream AI credit dependency: `docs_build/pr/BUILD_PR_26169_007-ai-credit-foundation.md`
- Upstream AI display dependency: `docs_build/pr/BUILD_PR_26169_008-ai-credit-display.md`
- Upstream marketplace revenue dependency: `docs_build/pr/BUILD_PR_26169_010-marketplace-revenue-model.md`
- Upstream teams dependency: `docs_build/pr/BUILD_PR_26169_012-teams-foundation.md`
- Upstream Owner settings dependencies: `docs_build/pr/BUILD_PR_26169_017-owner-memberships.md` and `docs_build/pr/BUILD_PR_26169_018-owner-ai-credits.md`

## Scope
- Extend existing Admin System Health API payload with read-only operational health data.
- Extend existing Admin System Health page to render the operational health summary and support tables.
- Add filters for invitation status, membership plan, and AI usage action.
- Add targeted unit and Playwright validation.

## Non-Scope
- No Owner settings editing.
- No Owner pricing, percentage, legal, founding program, AI action cost, or AI pack price controls for Admin.
- No payment settlement.
- No legal document editing.
- No broad infrastructure monitoring integration.
- No Admin support mutation or AI credit adjustment workflow.
- No schema/table additions.

## Target Files
- `src/dev-runtime/server/local-api-router.mjs`
- `admin/system-health.html`
- `assets/theme-v2/js/admin-system-health.js`
- `tests/dev-runtime/AdminHealthOperations.test.mjs`
- `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`

## Implementation Requirements
- Admin System Health must show operational health summaries for:
  - membership assignment counts and missing plan/limit failures.
  - beta invitation counts by status.
  - AI credit balances, monthly grants, debits, and insufficient-credit failure counts.
  - marketplace seller eligibility and revenue calculation readiness.
  - team membership limit violations or blocked invitations.
  - missing required DB configuration.
- Admin can inspect invitation records in read-only support tables.
- Admin can inspect AI usage and user credit issue summaries without editing Owner pricing.
- Admin can view membership support state without changing Owner-controlled pricing, percentages, limits, founding state, AI action costs, or pack prices.
- Diagnostics must identify missing plan, limit, invitation, AI action, credit pack, and user balance records.
- Admin support actions are not implemented in this PR; therefore no support mutation audit path is added.

## UI Requirements
- Page remains Admin-only through the existing Admin route guard.
- Existing Admin System Health page must render operational health sections.
- Show PASS/WARN/FAIL/SKIP status per subsystem.
- Provide filters for:
  - invitation status.
  - membership plan.
  - AI usage action.
- Owner-controlled business model fields must be read-only text only.
- No pricing, percentage, AI cost, AI pack price, legal, or founding edit controls appear on the Admin page.
- Missing configuration must appear as actionable Admin health issues.
- HTML must keep CSS and JavaScript external.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `admin/system-health.html`.
- Run targeted Admin health operations service validation:
  - `node --test tests/dev-runtime/AdminHealthOperations.test.mjs`
- Run targeted Admin health operations Playwright validation:
  - `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Run scoped `git diff --check`.
- Do not run full samples validation.

## Acceptance Criteria
- Admins can monitor platform operational health without Owner edit authority.
- Creator/non-Admin users cannot view the Admin dashboard.
- Required table health is visible and actionable.
- Missing `membership_limits` and `ai_credit_packs` rows produce visible warnings/failures.
- Invitation status counts are accurate.
- AI usage summaries match `ai_usage_log`.
- Admin dashboard does not become a hidden source of business model configuration.
