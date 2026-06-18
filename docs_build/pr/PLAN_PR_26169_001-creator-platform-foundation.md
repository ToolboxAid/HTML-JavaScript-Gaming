# PLAN_PR_26169_001-creator-platform-foundation

## Objective
- Establish the creator platform foundation that later membership, invitation, AI credit, marketplace, team, legal, owner, and admin PRs can build on without hardcoded business rules.

## Source Of Truth
- Approved business model from PR stack request:
  - Memberships: Free, Creator, Studio, Beta, Founding Creator, Founding Studio.
  - Marketplace access: everyone can browse, buy, and download free assets; Creator and higher can sell assets.
  - Revenue: creators receive 80% of Net Revenue.
  - AI credit packs: Small, Medium, Large; Studio receives 10% bonus purchased credits.
  - Roles: Creator, Admin, Owner.
  - Required tables: `membership_plans`, `membership_limits`, `user_memberships`, `founding_members`, `invitations`, `project_members`, `ai_actions`, `ai_credit_packs`, `user_ai_credits`, `ai_usage_log`.
- All pricing, percentages, limits, credits, and AI costs must be database-driven and Owner-editable.

## Scope
- Define platform-level service boundaries for membership, entitlement, role, AI credit, marketplace, team, legal, owner, and admin operations.
- Identify where future BUILD PRs must connect UI pages to API/service contracts backed by DB adapters.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No implementation code.
- No database migrations.
- No UI changes.
- No BUILD_PR or APPLY_PR documents.
- No Playwright changes.

## Implementation Requirements
- Future implementation must route product data through service contracts, not page-local arrays or hardcoded browser state.
- Creator, Admin, and Owner roles must be resolved through the existing user/role model and must not rely on hidden fallback users.
- The platform foundation must expose explicit contracts for:
  - Current user identity and role grants.
  - Current membership and limits.
  - Marketplace permissions.
  - AI credit balances and action costs.
  - Team membership limits.
  - Owner-editable configuration.
  - Admin health and operations read models.
- Error handling must fail visibly when user, role, membership, plan, limit, or configuration data is missing.
- Future BUILD PRs must inspect exact target files before editing and must keep each PR purpose isolated.

## Data Model Requirements
- This PR must define the canonical ownership map for required tables:
  - `membership_plans`: plan identity, pricing, public/beta/founding availability, marketplace selling eligibility, revenue percentage, purchased AI credit bonus.
  - `membership_limits`: storage, monthly AI credits, publish limits, team limits, collaboration flag, marketplace capability flags.
  - `user_memberships`: active and historical user plan assignments.
  - `founding_members`: first 100 paid founding membership records with locked active pricing.
  - `invitations`: beta and future invitation flows.
  - `project_members`: project collaboration membership.
  - `ai_actions`: database-driven AI action costs.
  - `ai_credit_packs`: purchasable credit packs and prices.
  - `user_ai_credits`: current included, purchased, and bonus balances.
  - `ai_usage_log`: immutable credit usage and grant ledger.
- All new shared records must include audit fields consistent with repo DB governance: `key`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- Plan codes must be stable uppercase values: `FREE`, `CREATOR`, `STUDIO`, `BETA`, `FOUNDING_CREATOR`, `FOUNDING_STUDIO`.

## UI Requirements
- No UI is implemented in this PR.
- Future UI must show role-appropriate navigation without exposing unavailable actions as working controls.
- Membership, marketplace, team, AI, owner, legal, and admin pages must consume service/API data rather than owning their own business model constants.
- Any unavailable action must explain the required membership or role.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted contract tests for each introduced service boundary.
- Future BUILD validation must confirm no runtime page persists pricing, percentages, limits, credits, or AI costs as hardcoded source of truth.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- The platform foundation plan names all required downstream business areas.
- The required database tables are listed with ownership intent.
- The requirement for database-driven, Owner-editable pricing, percentages, limits, credits, and AI costs is explicit.
- Dependencies for the full PR stack can reference this foundation as the shared contract.

## Dependencies
- Upstream: none.
- Downstream: PRs 002 through 019 depend on this foundation.

