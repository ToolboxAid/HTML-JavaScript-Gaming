# PLAN_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT

## Purpose
Add a browser/runtime test that validates every game listed from `games/index.html` can use its "Open with Workspace Manager" action, and audit whether `tools/shared/asteroidsPlatformDemo.js` crosses tool/game boundaries.

## Scope
- Add a games index Workspace Manager open test.
- Validate every game card/action uses the correct query:
  - `gameId=<id>`
  - `mount=game`
- Confirm direct launch remains separate from Workspace Manager launch.
- Audit `tools/shared/asteroidsPlatformDemo.js` boundary ownership.
- Advance roadmap status only.

## Non-Goals
- No broad tool UX rewrite.
- No sample dropdown removal in this PR.
- No start_of_day changes.
- No validators.
