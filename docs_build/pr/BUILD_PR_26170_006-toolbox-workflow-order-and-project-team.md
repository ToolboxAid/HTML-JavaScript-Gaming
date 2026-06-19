# BUILD PR_26170_006-toolbox-workflow-order-and-project-team

## Purpose
- Add Toolbox workflow-ordering governance.
- Document the Create group progression and Project Team planning focus.
- Keep this PR documentation-only with no runtime behavior changes.

## Scope
- Update Toolbox governance documentation.
- Update owner-facing grouping notes.
- Update Owner Notes source content for Toolbox/Create group planning.
- Do not change runtime JavaScript, CSS behavior, API behavior, database behavior, tool metadata contracts, routes, or rendered Toolbox behavior.

## Required Governance
- Toolbox groups are intentional workflow-order exceptions.
- Tiles are ordered by creator progression, not alphabetically.
- Order follows how users naturally work:
  - Select -> Create -> Review
  - Left -> Right
  - Top -> Bottom
- The next tile should represent the most likely next creator action.
- Tile ordering should minimize navigation decisions.
- Create group order:
  1. Game Workspace
  2. Game Configuration
  3. Project Team
  4. Tags
- Team distinction:
  - Studio Team = account-level roster
  - Project Team = project-level assignment
  - Current implementation focus is Project Team

## Validation
- Verify current branch is `main`.
- Run targeted documentation validation only.
- Verify ordering references are consistent.
- Confirm Playwright impact is No because there are no runtime/UI behavior changes.
- Do not run full samples.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_006-toolbox-workflow-order-and-project-team.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_006-toolbox-workflow-order-and-project-team_delta.zip`
