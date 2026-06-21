# PR_26172_OWNER_014-owner-team-start-command

## Scope

Create `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md` with ready-to-copy commands for:

- Start Team Alpha
- Start Team Beta
- Start Team Gamma

## Changes

- Added team start commands that require reading `README.txt` first.
- Required each command to read the backlog and team assignments files.
- Required each command to pull one available team item, mark it `[.]`, add the assignment, create one branch, and work only that assignment.
- Added hard stops when the target team already has an active branch or active assignment.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Markdown/text review

## Skipped Lanes

- Playwright skipped: documentation-only scope.
- Samples skipped: documentation-only scope.

## Package

- `tmp/PR_26172_OWNER_014-owner-team-start-command_delta.zip`
