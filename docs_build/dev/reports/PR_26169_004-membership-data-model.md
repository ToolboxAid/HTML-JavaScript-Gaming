# PR_26169_004-membership-data-model Report

## Scope
- PR: `PR_26169_004-membership-data-model`
- Source PLAN: `docs_build/pr/PLAN_PR_26169_004-membership-data-model.md`
- Approved business model dependency: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- BUILD doc: `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`

## Branch Validation
- Current branch before implementation: `main`
- Current branch before packaging: `main`
- Expected branch: `main`
- Result: PASS

## Requirement Checklist
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Read matching PLAN_PR before implementation: PASS
- Create BUILD_PR before implementation: PASS
- Implement only PR_26169_004 purpose: PASS
- Add `membership_plans` schema: PASS
- Add `membership_limits` schema: PASS
- Add `founding_members` schema: PASS
- Seed all six approved plans as DB-backed records: PASS
- Store prices, revenue share, purchased credit bonus, public/invitation/founding flags, and founding cap in plan records: PASS
- Store storage, monthly AI credits, publish limit, team limit, collaboration, marketplace permissions, and analytics tier in limit records: PASS
- Register membership tables in provider product-table contract: PASS
- Keep founding assignment records empty for PR_005: PASS
- Do not add membership assignment behavior, checkout, payment, Owner editor UI, membership page UI, marketplace enforcement, or AI credit ledger behavior: PASS
- No Playwright/runtime broad validation: PASS, not required for this data-model slice

## Implementation Summary
- Added stable seed keys for six membership plans and six matching limit rows.
- Added `membership_plans`, `membership_limits`, and `founding_members` to the mock DB schemas and standalone table owners.
- Seeded Free, Creator, Studio, Beta, Founding Creator, and Founding Studio plans from the approved business model.
- Seeded matching limit rows keyed by `membership_limits.planKey`.
- Registered membership model tables as Supabase product tables.
- Added focused tests for schema fields, seeded values, founding metadata, empty founding assignments, and provider table registration.

## Validation
- `git branch --show-current`: PASS (`main`)
- `node --check src/dev-runtime/persistence/mock-db-store.js`: PASS
- `node --check src/dev-runtime/seed/seed-db-keys.mjs`: PASS
- `node --check src/dev-runtime/seed/server-seed-loader.mjs`: PASS
- `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`: PASS
- `node --check tests/dev-runtime/MembershipDataModel.test.mjs`: PASS
- `node --test tests/dev-runtime/MembershipDataModel.test.mjs`: PASS, 4 tests passed
- Static scope scan for assignment/checkout/billing/payment/`user_memberships` behavior in PR_004 implementation files: PASS

## Lanes
- Impacted lane: dev-runtime product data schema/seed/provider contract.
- Skipped lanes: Playwright, full samples, broad runtime suite, UI, checkout, membership assignment, marketplace enforcement, AI credit ledger.
- Skip rationale: PLAN_PR_26169_004 is scoped to membership data model records only.
- Full suite requirement: Not triggered by this PR scope.

## Acceptance Criteria Evidence
- All six approved membership plans exist as DB-backed records keyed by stable code: PASS via `MembershipDataModel.test.mjs`.
- Approved pricing matches the business model: PASS via `MembershipDataModel.test.mjs`.
- Approved storage, AI credit, publish, team, collaboration, marketplace, and analytics values match the business model: PASS via `MembershipDataModel.test.mjs`.
- Creator/Studio revenue share is 80% Net Revenue: PASS via `revenueShareBps` assertions.
- Studio purchased AI credit bonus is 10%: PASS via `purchasedCreditBonusBps` assertions.
- Beta is invitation-only and Studio-equivalent: PASS via plan and limit assertions.
- Founding Creator and Founding Studio store locked active prices and first-100 eligibility metadata: PASS via `foundingMemberLimit` assertions.
- `founding_members` exists with required fields and no seeded assignments: PASS via schema and seed assertions.
- Membership tables are provider product tables for downstream DB-backed reads: PASS via provider contract assertions.

## Artifacts
- Changed files list: `docs_build/dev/reports/codex_changed_files.txt`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- ZIP artifact: `tmp/PR_26169_004-membership-data-model_delta.zip`
- ZIP validation: PASS, size 33466 bytes; entries match `codex_changed_files.txt` with repo-relative paths and no extras.
