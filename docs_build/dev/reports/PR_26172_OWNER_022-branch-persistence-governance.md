# PR_26172_OWNER_022-branch-persistence-governance

## Scope

Add branch persistence and branch context governance for all teams, including OWNER.

## Files Changed

- `docs_build/dev/ProjectInstructions/addendums/multi_team.md`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`

## Changes

- Added Branch Persistence Rule to the ProjectInstructions root.
- Added Branch Persistence Rule to the multi-team addendum.
- Added branch persistence/context reminder to team start commands.
- Added Branch Context Rule requiring Codex to report current branch, expected branch, active team, and active assignment at the beginning of every work session.
- Added stop behavior when the current branch does not match the assigned team/OWNER branch.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Text review for Branch Persistence Rule and Branch Context Rule

## Skipped Lanes

- Playwright skipped: documentation-only governance.
- Samples skipped: documentation-only governance.

## Package

- `tmp/PR_26172_OWNER_022-branch-persistence-governance_delta.zip`
