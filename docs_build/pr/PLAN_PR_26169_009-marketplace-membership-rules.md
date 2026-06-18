# PLAN_PR_26169_009-marketplace-membership-rules

## Objective
- Define marketplace entitlement rules based on active membership.

## Scope
- Future BUILD must enforce browse, buy, free download, and sell permissions through membership services.
- Use the approved marketplace model:
  - Everyone can browse.
  - Everyone can buy.
  - Everyone can download free assets.
  - Creator and higher can sell assets.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No marketplace revenue settlement.
- No category taxonomy implementation.
- No checkout provider implementation.
- No asset publishing UI beyond entitlement requirements.

## Implementation Requirements
- Marketplace browse must be available to all authenticated and guest users if current marketplace already supports guests.
- Buying and free downloads must be available to all platform users regardless of paid plan.
- Selling must require active Creator, Studio, Beta, Founding Creator, or Founding Studio membership.
- Free users cannot sell.
- Missing membership data must block selling with an actionable diagnostic.
- Marketplace checks must read `membership_limits.marketplaceSellEnabled`, not hardcoded plan names.
- UI actions and backend/service operations must enforce the same entitlement rule.

## Data Model Requirements
- Read entitlement fields from `membership_limits`:
  - `marketplaceBrowseEnabled`
  - `marketplaceBuyEnabled`
  - `marketplaceFreeDownloadEnabled`
  - `marketplaceSellEnabled`
- Read active membership from `user_memberships`.
- Do not duplicate marketplace permissions in marketplace item records.
- Marketplace item ownership remains outside this PR unless exact existing marketplace tables require a minimal permission join.

## UI Requirements
- Browse, buy, and free download controls remain visible for allowed users.
- Sell or create-listing controls must show an upgrade or membership-required state for Free users.
- Error messaging must name the required membership level as Creator or higher.
- Creator, Studio, Beta, Founding Creator, and Founding Studio users must see sell entry points when other marketplace prerequisites are satisfied.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted entitlement checks for:
  - Free can browse.
  - Free can buy.
  - Free can download free assets.
  - Free cannot sell.
  - Creator can sell.
  - Studio can sell.
  - Beta can sell.
  - Missing membership rejects sell.
- Playwright is required in future BUILD only if marketplace UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Marketplace permissions match the approved business model.
- Selling access is derived from DB-backed membership limits.
- Free users are blocked from selling consistently in UI and service paths.
- No marketplace permission relies on page-local plan constants.

## Dependencies
- Upstream: PR 004, PR 005.
- Downstream: PR 010, PR 011, PR 017.

