# BUILD_PR_26169_004-membership-data-model

## Objective
- Implement the database-driven membership plan, limits, and founding member data model for Free, Creator, Studio, Beta, Founding Creator, and Founding Studio without adding assignment, checkout, or UI behavior.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_004-membership-data-model.md`

## Scope
- Add `membership_plans`, `membership_limits`, and `founding_members` table schemas.
- Add stable seed keys for membership plans and limits.
- Seed all approved membership plans and limits from the approved business model.
- Register membership tables as product database tables for provider/db-backed access.
- Add focused data contract tests for plan values, limits, founding metadata, and provider table registration.

## Non-Scope
- No membership assignment behavior.
- No user membership records.
- No checkout, billing provider, or payment processing.
- No Owner editor UI.
- No membership page UI.
- No AI credit ledger beyond membership monthly credit fields.
- No marketplace enforcement beyond data fields.

## Exact Target Files
- `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/seed-db-keys.mjs`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `tests/dev-runtime/MembershipDataModel.test.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_004-membership-data-model.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- Membership plans must be queryable by stable plan code.
- All plan prices, revenue shares, purchased AI credit bonuses, plan availability flags, and founding flags must live in `membership_plans` rows.
- All storage limits, monthly AI credits, publish limits, team limits, collaboration flags, marketplace capability flags, and analytics tiers must live in `membership_limits` rows.
- `membership_limits.planKey` must reference `membership_plans.key`.
- Founding plan rows must store locked prices and reference their base plan code.
- Founding plan rows must expose the first-100 cap as database data for downstream assignment enforcement.
- `founding_members` must be present as an empty auditable table ready for PR_005 assignment behavior.

## Data Requirements
- `FREE`: $0/month, 250 MB storage, 0 monthly AI credits, publish limit 1, max team members 1, collaboration disabled, browse/buy/free-download enabled, selling disabled.
- `CREATOR`: $9/month, 1 GB storage, 100 monthly AI credits, nullable publish limit, max team members 3, collaboration enabled, selling enabled, creator analytics, 80% Net Revenue.
- `STUDIO`: $19/month, 4 GB storage, 400 monthly AI credits, nullable publish limit, max team members 10, collaboration enabled, selling enabled, advanced analytics, 80% Net Revenue, 10% purchased AI credit bonus.
- `BETA`: $0/month, invitation-only, Studio-equivalent limits and permissions.
- `FOUNDING_CREATOR`: $5/month locked while active, Creator-equivalent limits, first-100 founding cap.
- `FOUNDING_STUDIO`: $10/month locked while active, Studio-equivalent limits, first-100 founding cap.

## Validation Plan
- Branch validation before implementation and before packaging: current branch must be `main`.
- Syntax checks:
  - `node --check src/dev-runtime/persistence/mock-db-store.js`
  - `node --check src/dev-runtime/seed/seed-db-keys.mjs`
  - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check tests/dev-runtime/MembershipDataModel.test.mjs`
- Targeted contract validation:
  - `node --test tests/dev-runtime/MembershipDataModel.test.mjs`
- Static scope validation:
  - verify no membership assignment UI or `user_memberships` behavior is added in this PR.
- No full samples validation.
- No Playwright validation.

## Acceptance Criteria
- All six approved membership plans exist as DB-backed records keyed by stable code.
- All approved pricing, limits, revenue share, purchased credit bonus, collaboration, marketplace, team, and analytics values match the business model.
- Founding plans store locked active pricing and first-100 eligibility metadata.
- `founding_members` exists with required fields and no seeded assignments.
- Membership tables are included in the provider product-table contract for downstream DB-backed reads.
- No page-local or runtime-local membership plan array becomes the source of truth.

## Required Reports
- `docs_build/dev/reports/PR_26169_004-membership-data-model.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_004-membership-data-model_delta.zip`
