# PLAN_PR_26169_013-team-enforcement

## Objective
- Enforce team collaboration limits and member permissions across project team actions.

## Scope
- Future BUILD must apply team limit checks to invites, joins, removals, and role changes.
- Enforcement must use `project_members` and active membership limits.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No real-time collaborative editing.
- No organization billing.
- No advanced role permission matrix beyond owner/editor/viewer enforcement.
- No membership plan editing.

## Implementation Requirements
- Invite creation must reject when collaboration is disabled.
- Invite creation must reject when active plus pending accepted members would exceed plan limit.
- Joining an invitation must re-check the current team limit at acceptance time.
- Owner removal must be blocked unless ownership transfer exists in exact future scope.
- Role changes must preserve at least one owner.
- Removed users must lose project access immediately.
- Enforcement must apply consistently in UI-triggered and service/API-triggered paths.
- Error messages must name the active plan limit and current team count.

## Data Model Requirements
- Enforcement reads:
  - `project_members.status`
  - `project_members.role`
  - `membership_limits.maxTeamMembers`
  - `membership_limits.collaborationEnabled`
  - active membership from `user_memberships`
- No duplicate team limit fields may be added to project records.
- Audit fields must identify who invited, changed, or removed a member.

## UI Requirements
- Team management UI must show active count and plan limit.
- Invite button must be disabled or blocked with explanation when limit is reached.
- Free users must see no-collaboration messaging.
- Role controls must prevent removing the last owner.
- Status/log area must report invite, join, removal, and role-change outcomes.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted service/UI checks for:
  - Free invite blocked.
  - Creator fourth member blocked.
  - Studio eleventh member blocked.
  - Beta eleventh member blocked.
  - Join re-check blocks stale invite after limit reached.
  - Removed member cannot access project.
  - Last owner cannot be removed.
- Playwright is required in future BUILD only if team UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Collaboration limits are enforced at service boundary.
- UI states match service enforcement.
- Team count and max limit are visible to users.
- No team enforcement depends on hardcoded plan names.

## Dependencies
- Upstream: PR 012.
- Downstream: project collaboration and admin support PRs after this stack.

