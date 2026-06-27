# BUILD_PR_26169_017-owner-memberships

## Objective
- Implement Owner-only controls for DB-backed membership pricing, limits, marketplace revenue percentages, and founding program visibility.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_017-owner-memberships.md`
- Membership data dependency: `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`
- Membership assignment dependency: `docs_build/pr/BUILD_PR_26169_005-membership-assignment.md`
- Public membership display dependency: `docs_build/pr/BUILD_PR_26169_006-memberships-page-v2.md`
- Marketplace rules dependency: `docs_build/pr/BUILD_PR_26169_009-marketplace-membership-rules.md`
- Marketplace revenue dependency: `docs_build/pr/BUILD_PR_26169_010-marketplace-revenue-model.md`

## Scope
- Add an Owner membership settings service that reads and updates existing DB-backed membership records.
- Add Owner Local API routes and browser API client for membership settings.
- Add an Owner-only Memberships page.
- Add Owner navigation/route mapping to reach the page.
- Add targeted unit and Playwright validation.

## Non-Scope
- No payment provider checkout.
- No Admin invitation workflow changes.
- No AI action cost or AI credit pack pricing editor.
- No legal document editor.
- No marketplace listing, transaction, payout, or support workflow.
- No schema/table additions.

## Target Files
- `src/dev-runtime/memberships/owner-membership-settings-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/owner-memberships-api-client.js`
- `assets/theme-v2/js/owner-memberships.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `owner/memberships.html`
- `tests/dev-runtime/OwnerMemberships.test.mjs`
- `tests/playwright/tools/OwnerMembershipsPage.spec.mjs`

## Implementation Requirements
- Owner can view and edit membership plan fields:
  - monthly price.
  - active status.
  - public/invitation/founding flags.
  - revenue share percentage in basis points.
  - purchased credit bonus percentage in basis points.
- Owner can view and edit membership limit fields:
  - storage in MB.
  - monthly AI credits.
  - publish limit, including nullable unlimited values.
  - team limit.
  - collaboration enabled.
  - marketplace browse, buy, free download, and sell flags.
- Owner can view founding program state:
  - first 100 paid membership capacity.
  - assigned founding sequence count.
  - active founding count.
  - locked active founding prices.
- Owner changes must update audit fields.
- Invalid edits must be rejected before save with visible diagnostics.
- Non-Owners must not access the Owner editor API or page.
- Existing `membership_plans`, `membership_limits`, and `founding_members` tables remain the source of truth.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `owner/memberships.html`.
- Run targeted Owner membership service validation:
  - `node --test tests/dev-runtime/OwnerMemberships.test.mjs`
- Run targeted Owner membership page Playwright validation:
  - `npx playwright test tests/playwright/tools/OwnerMembershipsPage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Run scoped `git diff --check`.
- Do not run full samples validation.

## Acceptance Criteria
- Membership pricing, percentages, limits, and founding program settings are Owner-editable from DB-backed records.
- Owner edits are validated and audited.
- Non-Owners cannot access membership business model controls.
- Founding locked active prices are not overwritten by base plan price edits.
- Downstream membership, marketplace, and team services continue to read updated values through shared tables.
