# BUILD_PR_26169_012-teams-foundation

## Objective
- Implement the DB-backed project team foundation for collaboration membership and membership-limit-aware team contracts.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_012-teams-foundation.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream membership data model: `docs_build/pr/BUILD_PR_26169_004-membership-data-model.md`
- Upstream membership assignment: `docs_build/pr/BUILD_PR_26169_005-membership-assignment.md`

## Scope
- Add `project_members` as the shared project collaboration membership record model.
- Register `project_members` as a product DB table.
- Add a team service contract that can create project owner records, add members, remove members, and read team capacity from membership limits.
- Add targeted runtime contract tests.

## Non-Scope
- No UI.
- No Playwright.
- No real-time collaboration.
- No permissions matrix beyond owner/editor/viewer roles.
- No external organization/team billing.
- No PR_26169_013 enforcement UI or cross-feature enforcement.

## Target Files
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/teams/project-team-service.mjs`
- `tests/dev-runtime/TeamsFoundation.test.mjs`

## Implementation Requirements
- Add `project_members` schema fields:
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
- Allowed role values:
  - `owner`
  - `editor`
  - `viewer`
- Allowed status values:
  - `active`
  - `invited`
  - `removed`
- Owner must be represented as an active `project_members` record.
- Team capacity must be derived from `membership_limits.maxTeamMembers`.
- Collaboration availability must be derived from `membership_limits.collaborationEnabled`.
- Active team count must count active `project_members` records including owner.
- Free membership must allow owner only and block invited/active collaborators.
- Creator and Founding Creator must allow up to 3 total active members.
- Studio, Founding Studio, and Beta must allow up to 10 total active members.
- Removed members must not count against the active limit.
- Missing active membership must block member add/invite actions with visible diagnostics.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run targeted team foundation tests:
  - `node --test tests/dev-runtime/TeamsFoundation.test.mjs`
- Do not run Playwright.
- Do not run full samples validation.

## Acceptance Criteria
- `project_members` is registered as a DB-backed product table.
- Project owner member creation is covered.
- Free collaboration is blocked beyond the owner.
- Creator max 3 total active members is enforced.
- Studio max 10 total active members is enforced.
- Beta max 10 total active members is enforced.
- Removed members no longer count against the active limit.
- Missing active membership blocks invites/member addition.
- Service returns current active count, max count, remaining seats, and whether additional invitations are allowed.
