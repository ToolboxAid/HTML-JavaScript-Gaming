# PLAN_PR_26169_005-membership-assignment

## Objective
- Define the membership assignment service that applies Free, paid, Beta, and Founding memberships to users.

## Scope
- Future BUILD must create membership assignment behavior using `user_memberships`, `membership_plans`, `membership_limits`, `founding_members`, and `invitations`.
- Assignment must be database-backed and auditable.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No checkout provider integration.
- No Owner pricing UI.
- No memberships page redesign.
- No AI monthly credit grant job beyond assignment hooks needed for PR 007.

## Implementation Requirements
- Every platform user must resolve to exactly one active membership for entitlement checks.
- Users without paid, Beta, or founding membership must receive Free membership through an explicit DB-backed assignment path.
- Beta assignment must require an accepted valid invitation.
- Founding Creator and Founding Studio assignment must require paid membership eligibility and an available founding sequence within the first 100 paid memberships.
- Founding locked pricing remains while the founding membership is active.
- Membership changes must close or supersede the previous active `user_memberships` record without deleting history.
- Assignment must expose the active plan, limits, and source to downstream services.
- Invalid assignment requests must fail visibly with the exact reason.

## Data Model Requirements
- `user_memberships` required fields:
  - `key`
  - `userKey`
  - `planKey`
  - `status`
  - `source`
  - `startedAt`
  - `renewsAt`
  - `canceledAt`
  - `endedAt`
  - `invitationKey`
  - `foundingMemberKey`
  - `externalSubscriptionId`
  - audit fields
- Allowed `status` values: active, pending, canceled, expired, superseded.
- Allowed `source` values: free, paid, beta_invitation, founding_paid, admin_adjustment.
- `founding_members.sequenceNumber` must be unique from 1 through 100.
- Assignment must reference `membership_plans` and must not copy prices or limits into `user_memberships`.

## UI Requirements
- No UI is implemented in this PR.
- Future account/admin UI can call assignment services and show active membership state.
- Admin assignment diagnostics must identify user, requested plan, source, and failure reason.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include contract tests for:
  - Default Free assignment.
  - Creator assignment.
  - Studio assignment.
  - Beta assignment from accepted invitation.
  - Founding sequence assignment up to 100.
  - Rejection when founding capacity is exhausted.
  - Active membership uniqueness.
  - Historical membership preservation.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Active membership resolution is deterministic for every user.
- Assignment never depends on hidden defaults or browser storage.
- Beta and founding assignment rules are enforced through database records.
- Downstream entitlement, AI credit, marketplace, and team services can consume active membership data.

## Dependencies
- Upstream: PR 002, PR 003, PR 004.
- Downstream: PR 006, PR 007, PR 008, PR 009, PR 012, PR 013, PR 017.

