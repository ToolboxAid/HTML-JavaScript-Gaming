# PR_26172_OWNER_016-all-team-codex-execution-and-eod-merge-rule

## Scope

Update ProjectInstructions governance so Codex execution rules apply to all teams and merge behavior remains owner-controlled.

## Files Changed

- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md`
- `docs_build/dev/ProjectInstructions/addendums/multi_team.md`
- `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md`

## Changes

- Added all-team preferred Codex execution governance for Team Alfa through Team Zulu and Team OWNER.
- Clarified that sequential PR work may commit, push, and open draft PRs during active work on approved non-main branches.
- Added Day Work / EOD Merge governance.
- Added the exact required commit/push and EOD merge wording.
- Added a conflict note preserving older wording while requiring owner approval when merge or branch wording appears ambiguous.

## Validation

- `git diff --check`
- `git diff --cached --check`
- Markdown/text review
- Targeted text verification for all-team applicability, day-work commit/push wording, EOD merge wording, owner approval, and conflict note

## Skipped Lanes

- Playwright skipped: documentation-only scope.
- Samples skipped: documentation-only scope.

## Package

- `tmp/PR_26172_OWNER_016-all-team-codex-execution-and-eod-merge-rule_delta.zip`
