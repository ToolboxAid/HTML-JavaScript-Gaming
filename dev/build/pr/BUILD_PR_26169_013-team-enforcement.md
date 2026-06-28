# BUILD_PR_26169_013-team-enforcement

## Objective
- Enforce project team collaboration limits and basic owner/editor/viewer member rules at the service boundary.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_013-team-enforcement.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream team foundation: `docs_build/pr/BUILD_PR_26169_012-teams-foundation.md`

## Scope
- Extend the PR_26169_012 team service with explicit invite, join, role-change, removal, and access enforcement contracts.
- Enforce membership limits from `membership_limits.maxTeamMembers` and `membership_limits.collaborationEnabled`.
- Add targeted runtime enforcement tests.

## Non-Scope
- No UI.
- No Playwright.
- No real-time collaborative editing.
- No organization billing.
- No advanced permissions matrix beyond owner/editor/viewer service enforcement.
- No membership plan editing.
- No ownership transfer workflow.

## Target Files
- `src/dev-runtime/teams/project-team-service.mjs`
- `tests/dev-runtime/TeamEnforcement.test.mjs`

## Implementation Requirements
- Invite creation must reject when collaboration is disabled.
- Invite creation must reject when active plus pending invited members would exceed the membership limit.
- Joining an invitation must re-check the current active team count at acceptance time.
- Owner removal must stay blocked unless ownership transfer is explicitly scoped later.
- Role changes must preserve at least one active owner.
- Removed users must lose project access immediately.
- Enforcement must read:
  - `project_members.status`
  - `project_members.role`
  - `membership_limits.maxTeamMembers`
  - `membership_limits.collaborationEnabled`
  - active membership from `user_memberships`
- Error messages must name the active plan limit and current team count.
- No duplicate team limit fields may be added to project records.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed MJS files.
- Run targeted enforcement tests:
  - `node --test tests/dev-runtime/TeamEnforcement.test.mjs`
- Re-run foundation tests:
  - `node --test tests/dev-runtime/TeamsFoundation.test.mjs`
- Do not run Playwright.
- Do not run full samples validation.

## Acceptance Criteria
- Free invite is blocked by service enforcement.
- Creator fourth active/reserved member is blocked.
- Studio eleventh active/reserved member is blocked.
- Beta eleventh active/reserved member is blocked.
- Joining a stale invitation after the active limit is reached is blocked.
- Removed member cannot access the project.
- Last owner cannot be removed or demoted.
- Team enforcement is data-driven from membership limits and does not depend on hardcoded plan names.
