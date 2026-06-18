# PLAN_PR_26169_003-beta-invitations-admin

## Objective
- Plan the Admin beta invitation workflow that grants invitation-only Beta access with Studio-equivalent limits.

## Scope
- Add an Admin-managed invitation lifecycle for creating, listing, expiring, revoking, and accepting Beta invitations in a future BUILD PR.
- Use the approved Beta model:
  - $0/month.
  - 4 GB storage.
  - 400 AI credits/month.
  - Up to 10 team members.
  - Invitation only.
  - Studio-equivalent access.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No public self-service Beta signup.
- No paid membership checkout.
- No email delivery integration unless an existing notification contract already exists and is explicitly scoped in BUILD.
- No Owner membership pricing editor.

## Implementation Requirements
- Admins must be able to create invitations for a target email and plan code `BETA`.
- Invitation records must have explicit status: pending, accepted, revoked, expired.
- Invitation acceptance must be single-use.
- Expired, revoked, already accepted, or mismatched-email invitations must fail visibly.
- Accepted Beta invitations must create or update the user membership through the membership assignment service in PR 005.
- Admin invitation actions must be auditable.
- Beta access must be represented as a membership plan and limits record, not as an auth-only flag.

## Data Model Requirements
- `invitations` must support:
  - `key`
  - `email`
  - `invitationCode` or token hash
  - `planKey`
  - `status`
  - `invitedBy`
  - `expiresAt`
  - `acceptedBy`
  - `acceptedAt`
  - audit fields
- `membership_plans` must contain a `BETA` plan row.
- `membership_limits` must contain Beta limits matching Studio:
  - `storageMb = 4096`
  - `monthlyAiCredits = 400`
  - `maxTeamMembers = 10`
  - `collaborationEnabled = true`
  - marketplace sell enabled because Beta has Studio-equivalent access.
- Invitation acceptance must not store pricing or limits on the invitation itself beyond the referenced plan.

## UI Requirements
- Admin Invitations page or panel must list invitations with email, plan, status, expiration, invited by, and accepted by.
- Admins must have controls to create, revoke, and inspect invitations.
- Invitation acceptance UI must show clear success and failure states.
- Beta must be labeled invitation-only and Studio-equivalent without implying a paid subscription.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted admin and contract checks for:
  - Create pending Beta invitation.
  - Accept valid invitation.
  - Reject revoked invitation.
  - Reject expired invitation.
  - Reject duplicate acceptance.
  - Confirm accepted invitation feeds membership assignment.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Admins can manage Beta invitations through database-backed records.
- Beta access is assigned through membership data, not hidden auth state.
- Invalid invitation states fail with actionable messages.
- Invitation status changes are auditable.

## Dependencies
- Upstream: PR 001, PR 002.
- Downstream: PR 005, PR 006, PR 008, PR 012, PR 013.

