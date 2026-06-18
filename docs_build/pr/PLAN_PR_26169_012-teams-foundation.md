# PLAN_PR_26169_012-teams-foundation

## Objective
- Define the project team foundation for collaboration membership and team limits.

## Scope
- Future BUILD must introduce project membership records and service contracts.
- Team behavior must respect membership limits:
  - Free: no collaboration.
  - Creator and Founding Creator: up to 3 total project members.
  - Studio, Founding Studio, and Beta: up to 10 total project members.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No enforcement UI beyond foundation contracts.
- No real-time collaboration.
- No permissions matrix beyond basic project member roles.
- No external organization/team billing.

## Implementation Requirements
- Project owner must be represented as a project member.
- Team limit counts active `project_members` records including owner.
- Free membership must allow only the owner and must block invited collaborators.
- Creator and Founding Creator must allow up to 3 total active members.
- Studio, Founding Studio, and Beta must allow up to 10 total active members.
- Team member records must track role, status, inviter, and join date.
- Missing active membership must block collaboration actions with visible diagnostics.
- Team services must expose current count, max count, and whether additional invitations are allowed.

## Data Model Requirements
- `project_members` required fields:
  - `key`
  - `projectKey`
  - `userKey`
  - `role`
  - `status`
  - `invitedBy`
  - `invitedAt`
  - `joinedAt`
  - `removedAt`
  - audit fields
- Allowed `role` values for foundation: owner, editor, viewer.
- Allowed `status` values for foundation: active, invited, removed.
- Team limits must be read from `membership_limits.maxTeamMembers` and `membership_limits.collaborationEnabled`.
- Do not store membership plan limits on `project_members`.

## UI Requirements
- No UI is implemented in this PR.
- Future project/team UI must display current members, pending invites, and remaining seats.
- Free users must see collaboration unavailable messaging.
- Team controls must show disabled states when membership limits are reached.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted contract tests for:
  - Owner member creation.
  - Free collaboration disabled.
  - Creator max 3 total members.
  - Studio max 10 total members.
  - Beta max 10 total members.
  - Removed members no longer count against active limit.
  - Missing membership blocks invite.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Project collaboration has a DB-backed membership record model.
- Team limits are derived from membership limits.
- Free users cannot collaborate beyond project ownership.
- Downstream enforcement can rely on current count and max count from one service.

## Dependencies
- Upstream: PR 004, PR 005.
- Downstream: PR 013, PR 019.

