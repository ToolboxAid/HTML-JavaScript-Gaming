# BUILD_PR_26169_005-membership-assignment

## Objective
- Implement DB-backed membership assignment and active membership resolution for Free, paid Creator/Studio, Beta invitation, and Founding paid memberships without adding checkout integration, UI, or AI credit grants.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_005-membership-assignment.md`

## Scope
- Add the `user_memberships` table schema and provider table registration.
- Seed explicit Free memberships for existing seed users.
- Add a membership assignment service that assigns and resolves active memberships using `membership_plans`, `membership_limits`, `user_memberships`, `founding_members`, and `invitations`.
- Add Admin Local API routes for active membership diagnostics and assignment.
- Add focused contract tests for default Free resolution, Creator/Studio assignment, Beta invitation assignment, Founding assignment and capacity, active uniqueness, history preservation, and visible failures.

## Non-Scope
- No checkout provider integration.
- No Owner pricing UI.
- No memberships page redesign.
- No AI monthly credit grant job.
- No marketplace, team, or AI entitlement enforcement beyond returning active plan/limits for downstream services.

## Exact Target Files
- `docs_build/pr/BUILD_PR_26169_005-membership-assignment.md`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/seed-db-keys.mjs`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/memberships/membership-assignment-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/MembershipAssignment.test.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_005-membership-assignment.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- Every resolved user must return exactly one active membership or fail visibly if data has multiple active rows.
- Users without an active paid, Beta, or founding membership must receive an explicit Free `user_memberships` row through the assignment service.
- Assignments must reference `membership_plans.key`; `user_memberships` must not copy pricing, limits, revenue share, bonus, or marketplace fields.
- Assigning a new active membership must supersede previous active `user_memberships` rows and preserve history.
- Beta assignment must require an accepted invitation for the same user and the BETA plan.
- Founding assignment must require paid eligibility, allocate a unique sequence number from 1 through 100, create a `founding_members` row, and reject when capacity is exhausted.
- Founding locked pricing must live on `founding_members.lockedMonthlyPriceCents` while the membership references the founding plan.
- Assignment responses must expose membership, plan, limits, source, and diagnostics for downstream services.
- Invalid assignment requests must fail visibly with exact reasons and HTTP status codes when routed through Local API.

## Validation Plan
- Branch validation before implementation and before packaging: current branch must be `main`.
- Syntax checks:
  - `node --check src/dev-runtime/persistence/mock-db-store.js`
  - `node --check src/dev-runtime/seed/seed-db-keys.mjs`
  - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check src/dev-runtime/memberships/membership-assignment-service.mjs`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/dev-runtime/MembershipAssignment.test.mjs`
- Targeted contract validation:
  - `node --test tests/dev-runtime/MembershipAssignment.test.mjs`
- Static scope validation:
  - verify no checkout provider, payment, Owner UI, membership page UI, or AI grant job behavior is added.
- No full samples validation.
- No Playwright validation.

## Acceptance Criteria
- Default Free assignment is explicit and DB-backed.
- Creator and Studio paid assignments create active memberships and expose plan/limits.
- Beta assignment succeeds only from an accepted matching invitation.
- Founding assignment allocates unique sequence numbers up to 100 and rejects capacity exhaustion.
- New assignments supersede previous active memberships without deleting history.
- Active membership resolution is deterministic and fails visibly for duplicate active rows.
- Downstream services can consume active membership data from one response.

## Required Reports
- `docs_build/dev/reports/PR_26169_005-membership-assignment.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_005-membership-assignment_delta.zip`
