# BUILD_PR_26169_009-marketplace-membership-rules

## Objective
- Implement marketplace entitlement rules from active membership limits.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_009-marketplace-membership-rules.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream membership data model: `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`
- Upstream membership assignment: `docs_build/pr/BUILD_PR_26169_005-membership-assignment.md`

## Scope
- Add marketplace entitlement checks for browse, buy, free download, and sell.
- Add a read-only marketplace entitlement API for the current session.
- Add a small marketplace page display that reflects the entitlement service.
- Add targeted service/API and Playwright validation.

## Non-Scope
- No marketplace revenue settlement.
- No category taxonomy implementation.
- No checkout provider implementation.
- No asset publishing workflow.
- No marketplace listing persistence.

## Target Files
- `src/dev-runtime/marketplace/marketplace-entitlement-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/marketplace-api-client.js`
- `assets/theme-v2/js/marketplace-page.js`
- `marketplace/index.html`
- `tests/dev-runtime/MarketplaceMembershipRules.test.mjs`
- `tests/playwright/tools/PublicMarketplacePage.spec.mjs`

## Implementation Requirements
- Entitlements must read:
  - `membership_limits.marketplaceBrowseEnabled`
  - `membership_limits.marketplaceBuyEnabled`
  - `membership_limits.marketplaceFreeDownloadEnabled`
  - `membership_limits.marketplaceSellEnabled`
  - `user_memberships`
  - `membership_plans`
- Marketplace browse is available to guests and signed-in users.
- Buying and free downloads are available to signed-in platform users whose active membership limits allow them.
- Selling requires `marketplaceSellEnabled === true`.
- Free users must be blocked from selling.
- Creator, Studio, Beta, Founding Creator, and Founding Studio users must be allowed to sell through the DB-backed limit.
- Missing active membership data must block sell operations with an actionable diagnostic.
- Do not hardcode plan-name checks for sell permission.
- Service and UI must use the same entitlement payload.

## UI Requirements
- Update `marketplace/index.html` to load an external marketplace page module.
- Display browse, buy, free download, and sell action states.
- Show upgrade/membership-required messaging for Free users trying to sell.
- Name the required level as Creator or higher.
- Keep browse, buy, and free-download controls visible for allowed signed-in users.
- Keep all CSS and JavaScript external.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `marketplace/index.html`.
- Run targeted dev-runtime entitlement tests:
  - `node --test tests/dev-runtime/MarketplaceMembershipRules.test.mjs`
- Run targeted marketplace page Playwright tests:
  - `npx playwright test tests/playwright/tools/PublicMarketplacePage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Do not run full samples validation.

## Acceptance Criteria
- Free can browse, buy, and download free assets.
- Free cannot sell.
- Creator, Studio, Beta, Founding Creator, and Founding Studio can sell.
- Missing membership data rejects sell.
- Sell permission is derived from `membership_limits.marketplaceSellEnabled`.
- UI and service report the same entitlement rule.
- Required reports and repo-structured ZIP artifact are produced.

