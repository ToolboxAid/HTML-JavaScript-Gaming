# BUILD_PR_26169_010-marketplace-revenue-model

## Objective
- Implement DB-backed marketplace revenue model calculations where approved sellers receive 80% of Net Revenue.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_010-marketplace-revenue-model.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream membership data model: `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`
- Upstream marketplace membership rules: `docs_build/pr/BUILD_PR_26169_009-marketplace-membership-rules.md`

## Scope
- Add marketplace revenue calculation service using `membership_plans.revenueShareBps`.
- Add seller-facing revenue model data to the marketplace entitlement API response.
- Update the Marketplace page to display service-backed "80% of Net Revenue" and deduction categories.
- Add targeted revenue model and marketplace page validation.

## Non-Scope
- No payment provider integration.
- No payout execution.
- No tax filing workflow.
- No marketplace category UI.
- No transaction table creation.

## Target Files
- `src/dev-runtime/marketplace/marketplace-revenue-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `assets/theme-v2/js/marketplace-page.js`
- `marketplace/index.html`
- `tests/dev-runtime/MarketplaceRevenueModel.test.mjs`
- `tests/playwright/tools/PublicMarketplacePage.spec.mjs`

## Implementation Requirements
- Read creator revenue share from `membership_plans.revenueShareBps`.
- Approved selling memberships must use the seeded `8000` basis-point value.
- Calculate Net Revenue as:
  - sale amount
  - less processing fees
  - less taxes
  - less refunds
  - less chargebacks
  - less required deductions
- Creator payout must be calculated from Net Revenue, not gross sale amount.
- Negative Net Revenue must not create a positive creator payout.
- Refund and chargeback inputs must be explicit and included in calculation evidence.
- Free users must not produce seller revenue.
- Do not hardcode 80% in runtime logic; UI display must use the service-backed basis-point value.

## UI Requirements
- Show seller-facing revenue model on `marketplace/index.html`.
- Display "80% of Net Revenue" only when service data reports the active seller share.
- Show deduction categories included in Net Revenue.
- Do not show payout estimates when required fee/tax/refund data is incomplete.
- Owner editing remains out of scope.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `marketplace/index.html`.
- Run targeted revenue model tests:
  - `node --test tests/dev-runtime/MarketplaceRevenueModel.test.mjs`
- Re-run marketplace membership rule tests because the entitlement API payload is extended:
  - `node --test tests/dev-runtime/MarketplaceMembershipRules.test.mjs`
- Run targeted marketplace page Playwright tests:
  - `npx playwright test tests/playwright/tools/PublicMarketplacePage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Do not run full samples validation.

## Acceptance Criteria
- Creator share is calculated from DB-backed 8000 bps revenue share.
- Net Revenue excludes processing fees and taxes.
- Refunds reduce Net Revenue.
- Chargebacks reduce Net Revenue.
- Negative Net Revenue produces zero positive creator payout and explicit negative adjustment evidence.
- Free users cannot create seller revenue.
- Marketplace UI uses service-backed revenue model data.
- Required reports and repo-structured ZIP artifact are produced.

